import { createClient } from '@supabase/supabase-js'
import Constants from 'expo-constants'

const extra = Constants.expoConfig?.extra as any
const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL ??
  extra?.EXPO_PUBLIC_SUPABASE_URL ??
  extra?.supabaseUrl
const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
  extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
  extra?.supabaseAnonKey

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})
