-- Recipe Hub Database Schema - Safe Version
-- Run this in your Supabase SQL Editor

-- Create recipes table
CREATE TABLE IF NOT EXISTS recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR NOT NULL,
  ingredients JSONB NOT NULL,
  instructions TEXT NOT NULL,
  prep_time INTEGER NOT NULL,
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

-- Create policies only if they don't exist
DO $$ 
BEGIN
    -- Check and create SELECT policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'recipes' AND policyname = 'Anyone can view recipes'
    ) THEN
        CREATE POLICY "Anyone can view recipes" ON recipes 
            FOR SELECT USING (true);
    END IF;

    -- Check and create INSERT policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'recipes' AND policyname = 'Anyone can insert recipes'
    ) THEN
        CREATE POLICY "Anyone can insert recipes" ON recipes 
            FOR INSERT WITH CHECK (true);
    END IF;

    -- Check and create UPDATE policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'recipes' AND policyname = 'Anyone can update recipes'
    ) THEN
        CREATE POLICY "Anyone can update recipes" ON recipes 
            FOR UPDATE USING (true);
    END IF;

    -- Check and create DELETE policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'recipes' AND policyname = 'Anyone can delete recipes'
    ) THEN
        CREATE POLICY "Anyone can delete recipes" ON recipes 
            FOR DELETE USING (true);
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_recipes_created_at ON recipes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_recipes_title ON recipes USING GIN (to_tsvector('english', title));