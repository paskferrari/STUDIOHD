import { create } from 'zustand';

interface AttendanceState {
  isCheckedIn: boolean;
  currentAttendance: any | null;
  setCheckedIn: (status: boolean, attendance?: any) => void;
}

export const useAttendanceStore = create<AttendanceState>((set) => ({
  isCheckedIn: false,
  currentAttendance: null,
  setCheckedIn: (isCheckedIn, currentAttendance = null) => 
    set({ isCheckedIn, currentAttendance }),
}));
