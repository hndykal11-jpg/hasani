import { createClient } from '@supabase/supabase-js';

// تم تحديث الرابط والمفتاح بناءً على البيانات المقدمة
const supabaseUrl = process.env.SUPABASE_URL || 'https://ijgwrbeiaoxmzdxlarsk.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqZ3dyYmVpYW94bXpkeGxhcnNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1MjgzMTksImV4cCI6MjA4MDEwNDMxOX0.ZDDd1oFvyKHxv1ac5TKAnonN2FWEixjS8vjz82Iq19w';

export const supabase = createClient(supabaseUrl, supabaseKey);