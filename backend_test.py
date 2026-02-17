#!/usr/bin/env python3
"""
Studio Hub Elite Backend API Testing Script
Tests all backend endpoints with proper authentication
"""

import requests
import json
import uuid
import time
from datetime import datetime, timedelta
from typing import Dict, Any, Optional

class BackendTester:
    def __init__(self):
        self.base_url = "https://studio-hub-elite.preview.emergentagent.com/api"
        self.session_token = None
        self.user_id = None
        self.test_results = {}
        
    def log_result(self, endpoint: str, success: bool, details: str, response_data: Any = None):
        """Log test result"""
        self.test_results[endpoint] = {
            "success": success,
            "details": details,
            "response_data": response_data,
            "timestamp": datetime.now().isoformat()
        }
        
        status = "✅" if success else "❌"
        print(f"{status} {endpoint}: {details}")
        if response_data and not success:
            print(f"   Response: {json.dumps(response_data, indent=2) if isinstance(response_data, dict) else str(response_data)}")
    
    def create_test_user(self) -> bool:
        """Create test user and session in MongoDB"""
        print("\n🔧 Setting up test user and session...")
        
        # Generate unique test data
        timestamp = int(time.time() * 1000)
        self.user_id = f"test-user-{timestamp}"
        self.session_token = f"test_session_{timestamp}"
        
        # MongoDB script to create test user and session
        mongo_script = f'''
use('test_database');
var userId = '{self.user_id}';
var sessionToken = '{self.session_token}';
db.users.insertOne({{
  user_id: userId,
  email: 'test.user.{timestamp}@example.com',
  name: 'Test User {timestamp}',
  picture: 'https://via.placeholder.com/150',
  roles: ['music', 'gaming'],
  level: 1,
  xp: 0,
  streak_days: 0,
  onboarding_completed: true,
  goals: ['improve_skills'],
  is_admin: false,
  created_at: new Date()
}});
db.user_sessions.insertOne({{
  user_id: userId,
  session_token: sessionToken,
  expires_at: new Date(Date.now() + 7*24*60*60*1000),
  created_at: new Date()
}});
print('User created: ' + userId);
print('Session token: ' + sessionToken);
'''
        
        import subprocess
        try:
            result = subprocess.run(
                ['mongosh', '--eval', mongo_script],
                capture_output=True,
                text=True,
                timeout=30
            )
            
            if result.returncode == 0:
                print(f"✅ Test user created: {self.user_id}")
                print(f"✅ Session token: {self.session_token}")
                return True
            else:
                print(f"❌ Failed to create test user: {result.stderr}")
                return False
                
        except Exception as e:
            print(f"❌ Error creating test user: {str(e)}")
            return False
    
    def make_request(self, method: str, endpoint: str, data: Optional[Dict] = None, headers: Optional[Dict] = None) -> tuple[bool, Any]:
        """Make HTTP request with proper headers"""
        url = f"{self.base_url}{endpoint}"
        
        # Default headers
        request_headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.session_token}" if self.session_token else ""
        }
        
        if headers:
            request_headers.update(headers)
        
        try:
            if method.upper() == "GET":
                response = requests.get(url, headers=request_headers, timeout=10)
            elif method.upper() == "POST":
                response = requests.post(url, json=data, headers=request_headers, timeout=10)
            elif method.upper() == "PUT":
                response = requests.put(url, json=data, headers=request_headers, timeout=10)
            elif method.upper() == "DELETE":
                response = requests.delete(url, headers=request_headers, timeout=10)
            else:
                return False, f"Unsupported method: {method}"
            
            # Parse response
            try:
                response_data = response.json()
            except:
                response_data = response.text
            
            return response.status_code < 400, response_data
            
        except requests.RequestException as e:
            return False, f"Request failed: {str(e)}"
    
    def test_health(self):
        """Test health endpoint"""
        success, data = self.make_request("GET", "/health")
        if success:
            self.log_result("/api/health", True, "Health check passed", data)
        else:
            self.log_result("/api/health", False, f"Health check failed", data)
    
    def test_auth_me(self):
        """Test auth/me endpoint"""
        success, data = self.make_request("GET", "/auth/me")
        if success and isinstance(data, dict) and data.get("user_id") == self.user_id:
            self.log_result("/api/auth/me", True, "Auth me endpoint working", data)
        else:
            self.log_result("/api/auth/me", False, f"Auth me failed or incorrect user", data)
    
    def test_user_profile(self):
        """Test users/profile endpoint"""
        success, data = self.make_request("GET", "/users/profile")
        if success and isinstance(data, dict) and data.get("user_id") == self.user_id:
            self.log_result("/api/users/profile", True, "User profile endpoint working", data)
        else:
            self.log_result("/api/users/profile", False, f"User profile failed", data)
    
    def test_attendance_status(self):
        """Test attendance status endpoint"""
        success, data = self.make_request("GET", "/attendance/status")
        if success:
            self.log_result("/api/attendance/status", True, "Attendance status working", data)
        else:
            self.log_result("/api/attendance/status", False, f"Attendance status failed", data)
    
    def test_attendance_checkin(self):
        """Test attendance check-in"""
        checkin_data = {
            "session_id": f"session_{int(time.time())}"
        }
        success, data = self.make_request("POST", "/attendance/check-in", checkin_data)
        if success:
            self.log_result("/api/attendance/check-in", True, "Check-in working", data)
        else:
            self.log_result("/api/attendance/check-in", False, f"Check-in failed", data)
    
    def test_attendance_checkout(self):
        """Test attendance check-out"""
        success, data = self.make_request("POST", "/attendance/check-out")
        if success:
            self.log_result("/api/attendance/check-out", True, "Check-out working", data)
        else:
            self.log_result("/api/attendance/check-out", False, f"Check-out failed", data)
    
    def test_attendance_history(self):
        """Test attendance history"""
        success, data = self.make_request("GET", "/attendance/history")
        if success:
            self.log_result("/api/attendance/history", True, "Attendance history working", data)
        else:
            self.log_result("/api/attendance/history", False, f"Attendance history failed", data)
    
    def test_attendance_heatmap(self):
        """Test attendance heatmap"""
        success, data = self.make_request("GET", "/attendance/heatmap")
        if success:
            self.log_result("/api/attendance/heatmap", True, "Attendance heatmap working", data)
        else:
            self.log_result("/api/attendance/heatmap", False, f"Attendance heatmap failed", data)
    
    def test_create_track(self):
        """Test creating a track"""
        track_data = {
            "title": "Test Track Studio Elite",
            "artist": "Test Artist",
            "genre": "Electronic",
            "duration": 240,
            "description": "A test track for Studio Hub Elite"
        }
        
        success, data = self.make_request("POST", "/tracks", track_data)
        if success and isinstance(data, dict) and data.get("track_id"):
            self.log_result("/api/tracks (POST)", True, "Track creation working", data)
            return data.get("track_id")
        else:
            self.log_result("/api/tracks (POST)", False, f"Track creation failed", data)
            return None
    
    def test_get_tracks(self):
        """Test getting tracks list"""
        success, data = self.make_request("GET", "/tracks")
        if success:
            self.log_result("/api/tracks (GET)", True, "Get tracks working", data)
        else:
            self.log_result("/api/tracks (GET)", False, f"Get tracks failed", data)
    
    def test_create_match(self):
        """Test creating a gaming match"""
        match_data = {
            "name": "Test Gaming Match",
            "game_type": "fps",
            "max_players": 8,
            "description": "A test gaming match for Studio Hub Elite"
        }
        
        success, data = self.make_request("POST", "/matches", match_data)
        if success and isinstance(data, dict) and data.get("match_id"):
            self.log_result("/api/matches (POST)", True, "Match creation working", data)
            return data.get("match_id")
        else:
            self.log_result("/api/matches (POST)", False, f"Match creation failed", data)
            return None
    
    def test_get_matches(self):
        """Test getting matches list"""
        success, data = self.make_request("GET", "/matches")
        if success:
            self.log_result("/api/matches (GET)", True, "Get matches working", data)
        else:
            self.log_result("/api/matches (GET)", False, f"Get matches failed", data)
    
    def test_leaderboards(self):
        """Test main leaderboards endpoint"""
        success, data = self.make_request("GET", "/leaderboards")
        if success:
            self.log_result("/api/leaderboards", True, "Main leaderboards working", data)
        else:
            self.log_result("/api/leaderboards", False, f"Main leaderboards failed", data)
    
    def test_leaderboards_attendance(self):
        """Test attendance monthly leaderboard"""
        success, data = self.make_request("GET", "/leaderboards/attendance_monthly")
        if success:
            self.log_result("/api/leaderboards/attendance_monthly", True, "Attendance leaderboard working", data)
        else:
            self.log_result("/api/leaderboards/attendance_monthly", False, f"Attendance leaderboard failed", data)
    
    def test_gamification_stats(self):
        """Test gamification stats"""
        success, data = self.make_request("GET", "/gamification/stats")
        if success:
            self.log_result("/api/gamification/stats", True, "Gamification stats working", data)
        else:
            self.log_result("/api/gamification/stats", False, f"Gamification stats failed", data)
    
    def test_badges(self):
        """Test badges list"""
        success, data = self.make_request("GET", "/badges")
        if success:
            self.log_result("/api/badges", True, "Badges list working", data)
        else:
            self.log_result("/api/badges", False, f"Badges list failed", data)
    
    def test_user_badges(self):
        """Test user badges"""
        success, data = self.make_request("GET", "/user/badges")
        if success:
            self.log_result("/api/user/badges", True, "User badges working", data)
        else:
            self.log_result("/api/user/badges", False, f"User badges failed", data)
    
    def test_activity_feed(self):
        """Test activity feed"""
        success, data = self.make_request("GET", "/activity/feed")
        if success:
            self.log_result("/api/activity/feed", True, "Activity feed working", data)
        else:
            self.log_result("/api/activity/feed", False, f"Activity feed failed", data)
    
    def cleanup_test_data(self):
        """Clean up test data from MongoDB"""
        print("\n🧹 Cleaning up test data...")
        
        mongo_script = f'''
use('test_database');
db.users.deleteMany({{email: /test\\.user\\./}});
db.user_sessions.deleteMany({{session_token: /test_session/}});
db.attendance.deleteMany({{user_id: '{self.user_id}'}});
db.tracks.deleteMany({{created_by: '{self.user_id}'}});
db.matches.deleteMany({{created_by: '{self.user_id}'}});
print('Cleaned up test data');
'''
        
        import subprocess
        try:
            subprocess.run(['mongosh', '--eval', mongo_script], timeout=15)
            print("✅ Test data cleaned up")
        except Exception as e:
            print(f"⚠️ Cleanup warning: {str(e)}")
    
    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting Studio Hub Elite Backend API Tests")
        print(f"🌐 Testing against: {self.base_url}")
        
        # Setup test environment
        if not self.create_test_user():
            print("❌ Cannot create test user. Exiting.")
            return
        
        try:
            # Basic endpoints
            print("\n📋 Testing Basic Endpoints")
            self.test_health()
            self.test_auth_me()
            self.test_user_profile()
            
            # Attendance endpoints
            print("\n📅 Testing Attendance Endpoints")
            self.test_attendance_status()
            self.test_attendance_checkin()
            self.test_attendance_checkout()
            self.test_attendance_history()
            self.test_attendance_heatmap()
            
            # Music endpoints
            print("\n🎵 Testing Music Endpoints")
            track_id = self.test_create_track()
            self.test_get_tracks()
            
            # Gaming endpoints
            print("\n🎮 Testing Gaming Endpoints")
            match_id = self.test_create_match()
            self.test_get_matches()
            
            # Leaderboard endpoints
            print("\n🏆 Testing Leaderboard Endpoints")
            self.test_leaderboards()
            self.test_leaderboards_attendance()
            
            # Gamification endpoints
            print("\n🎯 Testing Gamification Endpoints")
            self.test_gamification_stats()
            self.test_badges()
            self.test_user_badges()
            self.test_activity_feed()
            
        finally:
            # Cleanup
            self.cleanup_test_data()
        
        # Summary
        print(self.get_summary())
    
    def get_summary(self) -> str:
        """Generate test summary"""
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results.values() if result["success"])
        failed_tests = total_tests - passed_tests
        
        summary = f"\n📊 TEST SUMMARY\n"
        summary += f"================\n"
        summary += f"Total Tests: {total_tests}\n"
        summary += f"✅ Passed: {passed_tests}\n"
        summary += f"❌ Failed: {failed_tests}\n"
        summary += f"Success Rate: {(passed_tests/total_tests)*100:.1f}%\n\n"
        
        if failed_tests > 0:
            summary += "❌ FAILED TESTS:\n"
            for endpoint, result in self.test_results.items():
                if not result["success"]:
                    summary += f"  - {endpoint}: {result['details']}\n"
        
        return summary

if __name__ == "__main__":
    tester = BackendTester()
    tester.run_all_tests()