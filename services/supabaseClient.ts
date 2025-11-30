import { createClient } from '@supabase/supabase-js';

// Safe access to process.env to prevent "process is not defined" error in browser
const getEnvVar = (key: string, fallback: string) => {
  try {
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key];
    }
  } catch (e) {
    // Ignore error if process is not defined
  }
  return fallback;
};

// تم تحديث الرابط والمفتاح بناءً على البيانات المقدمة
const supabaseUrl = getEnvVar('SUPABASE_URL', 'https://ijgwrbeiaoxmzdxlarsk.supabase.co');
const supabaseKey = getEnvVar('SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqZ3dyYmVpYW94bXpkeGxhcnNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1MjgzMTksImV4cCI6MjA4MDEwNDMxOX0.ZDDd1oFvyKHxv1ac5TKAnonN2FWEixjS8vjz82Iq19w');

export const supabase = createClient(supabaseUrl, supabaseKey);