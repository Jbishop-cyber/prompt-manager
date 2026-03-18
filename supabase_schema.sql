-- 1. Create Categories Table
CREATE TABLE categories (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) default auth.uid() not null,
  name text not null,
  color text default '#6c63ff',
  icon text default '📁',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create Prompts Table
CREATE TABLE prompts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) default auth.uid() not null,
  title text not null,
  content text not null,
  category text default 'cat-general',
  tags jsonb default '[]'::jsonb,
  rating integer default 0,
  favorite boolean default false,
  versions jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Enable Row-Level Security (RLS)
-- This ensures users can only read/write their own data
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;

-- 4. Create Security Policies
-- Allow users to fully manage their own categories
CREATE POLICY "Manage Categories" ON categories FOR ALL USING (auth.uid() = user_id);

-- Allow users to fully manage their own prompts
CREATE POLICY "Manage Prompts" ON prompts FOR ALL USING (auth.uid() = user_id);
