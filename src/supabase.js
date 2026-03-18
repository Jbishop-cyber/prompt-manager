// Initialize Supabase Client
const SUPABASE_URL = 'https://zywhdpyccrswocdrqllb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5d2hkcHljY3Jzd29jZHJxbGxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3NjUzMzYsImV4cCI6MjA4OTM0MTMzNn0._OV3sRn2-03EaYgBr-WfBWp4dc4hT1xL63yzL4jBZQE';

export const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
