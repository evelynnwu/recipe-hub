-- Recipe Hub Database Schema - Consolidated Version
-- Run this in your Supabase SQL Editor
-- Safe to run multiple times (idempotent)

-- This file only contains recipes table and related functionality
-- For complete setup, also run:
-- 1. database/001_user_profiles.sql (user profiles, search view, triggers)
-- 2. database/002_friendships.sql (friendships table, policies, functions)

-- ============================================================================
-- RECIPES TABLE AND FUNCTIONALITY
-- ============================================================================

-- Create recipes table
CREATE TABLE IF NOT EXISTS recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR NOT NULL,
  ingredients JSONB NOT NULL,
  instructions TEXT NOT NULL,
  prep_time VARCHAR,
  cook_time VARCHAR,
  image VARCHAR,
  success BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an updated_at trigger function (safe to run multiple times)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at (only if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_recipes_updated_at'
    ) THEN
        CREATE TRIGGER update_recipes_updated_at 
            BEFORE UPDATE ON recipes 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Enable Row Level Security (RLS)
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

-- Basic RLS policy - users can view their own recipes
-- (Friends policy will be added after friendships table is created)
DROP POLICY IF EXISTS "Users can view own recipes" ON recipes;
CREATE POLICY "Users can view own recipes" ON recipes 
    FOR SELECT USING (auth.uid() = user_id);

-- Users can only modify their own recipes
CREATE POLICY "Users can insert own recipes" ON recipes 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recipes" ON recipes 
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recipes" ON recipes 
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_recipes_user_id ON recipes(user_id);
CREATE INDEX IF NOT EXISTS idx_recipes_created_at ON recipes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_recipes_title ON recipes USING GIN (to_tsvector('english', title));