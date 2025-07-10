
-- Migration: Add privacy field to feed_posts table
-- This allows posts to have different privacy levels

-- Add privacy column to feed_posts
ALTER TABLE public.feed_posts 
ADD COLUMN privacy TEXT DEFAULT 'PUBLIC' CHECK (privacy IN ('PUBLIC', 'CONNECTIONS', 'PRIVATE'));

-- Create index for privacy filtering
CREATE INDEX idx_feed_posts_privacy ON public.feed_posts(privacy);

-- Update existing posts to have PUBLIC privacy
UPDATE public.feed_posts SET privacy = 'PUBLIC' WHERE privacy IS NULL;
