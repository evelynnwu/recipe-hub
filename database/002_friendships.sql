-- Create friendships table for managing friend connections
CREATE TABLE IF NOT EXISTS friendships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  friend_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT CHECK (status IN ('pending', 'accepted', 'blocked')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  
  -- Ensure users can't friend themselves
  CONSTRAINT no_self_friendship CHECK (user_id != friend_id),
  -- Prevent duplicate friendship records - use simple unique constraint
  -- The application layer will handle ensuring consistent ordering (smaller UUID first)
  CONSTRAINT unique_friendship UNIQUE (user_id, friend_id)
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_friendships_user_id ON friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_friend_id ON friendships(friend_id);
CREATE INDEX IF NOT EXISTS idx_friendships_status ON friendships(status);

-- Composite indexes for bidirectional friendship lookups and RLS performance
CREATE INDEX IF NOT EXISTS idx_friendships_bidirectional 
ON friendships(user_id, friend_id, status);

CREATE INDEX IF NOT EXISTS idx_friendships_bidirectional_reverse 
ON friendships(friend_id, user_id, status);

-- Index for RLS policy performance (optimizes recipe permission checks)
CREATE INDEX IF NOT EXISTS idx_friendships_status_users 
ON friendships(status, user_id, friend_id);

-- Enable Row Level Security
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

-- RLS Policies for friendships
-- Users can view friendships they're involved in
CREATE POLICY "Users can view own friendships" ON friendships
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Users can create friendship requests
CREATE POLICY "Users can create friendships" ON friendships
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update friendships they're involved in (for accepting/blocking)
CREATE POLICY "Users can update own friendships" ON friendships
  FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Users can delete friendships they're involved in
CREATE POLICY "Users can delete own friendships" ON friendships
  FOR DELETE USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Function to get mutual friends count (handles bidirectional friendships)
CREATE OR REPLACE FUNCTION get_mutual_friends_count(user1_id UUID, user2_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    WITH user1_friends AS (
      -- Get all accepted friends of user1 (both directions)
      SELECT CASE 
        WHEN user_id = user1_id THEN friend_id 
        ELSE user_id 
      END as friend_id
      FROM friendships 
      WHERE (user_id = user1_id OR friend_id = user1_id) 
        AND status = 'accepted'
    ),
    user2_friends AS (
      -- Get all accepted friends of user2 (both directions)  
      SELECT CASE 
        WHEN user_id = user2_id THEN friend_id 
        ELSE user_id 
      END as friend_id
      FROM friendships 
      WHERE (user_id = user2_id OR friend_id = user2_id) 
        AND status = 'accepted'
    )
    -- Count mutual friends (excluding user1 and user2 themselves)
    SELECT COUNT(*)
    FROM user1_friends u1
    INNER JOIN user2_friends u2 ON u1.friend_id = u2.friend_id
    WHERE u1.friend_id NOT IN (user1_id, user2_id)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- RECIPES TABLE FRIENDS POLICY (run after friendships table exists)
-- ============================================================================

-- Add policy to allow viewing friends' recipes (if recipes table exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'recipes') THEN
        -- Drop existing friends policy if it exists
        DROP POLICY IF EXISTS "Users can view friends recipes" ON recipes;
        
        -- Create comprehensive policy for friends' recipes
        CREATE POLICY "Users can view friends recipes" ON recipes 
            FOR SELECT USING (
              auth.uid() = user_id OR 
              EXISTS (
                SELECT 1 FROM friendships 
                WHERE status = 'accepted' 
                  AND (
                    (user_id = auth.uid() AND friend_id = recipes.user_id) OR
                    (friend_id = auth.uid() AND user_id = recipes.user_id)
                  )
              )
            );
    END IF;
END $$;