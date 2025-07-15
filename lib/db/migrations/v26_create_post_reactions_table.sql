
-- Create post_reactions table for enhanced reactions system
CREATE TABLE IF NOT EXISTS public.post_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES public.feed_posts(id) ON DELETE CASCADE,
    reaction_type VARCHAR(50) NOT NULL DEFAULT 'like',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, post_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_post_reactions_post_id ON public.post_reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_post_reactions_user_id ON public.post_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_post_reactions_type ON public.post_reactions(reaction_type);

-- Add RLS policies
ALTER TABLE public.post_reactions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read all reactions
CREATE POLICY "Users can read post reactions" ON public.post_reactions
    FOR SELECT USING (true);

-- Policy: Users can insert their own reactions
CREATE POLICY "Users can insert their own reactions" ON public.post_reactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own reactions
CREATE POLICY "Users can update their own reactions" ON public.post_reactions
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete their own reactions
CREATE POLICY "Users can delete their own reactions" ON public.post_reactions
    FOR DELETE USING (auth.uid() = user_id);
