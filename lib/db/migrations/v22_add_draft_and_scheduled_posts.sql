
-- Add post drafts table
CREATE TABLE IF NOT EXISTS public.post_drafts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT,
    image_url TEXT,
    post_type public.post_type DEFAULT 'GENERAL'::public.post_type,
    tags TEXT[],
    subjects TEXT[],
    achievement_type TEXT,
    project_category TEXT,
    difficulty_level TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Add scheduled posts table
CREATE TABLE IF NOT EXISTS public.scheduled_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    image_url TEXT,
    scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
    post_type public.post_type DEFAULT 'GENERAL'::public.post_type,
    tags TEXT[],
    subjects TEXT[],
    achievement_type TEXT,
    project_category TEXT,
    difficulty_level TEXT,
    status TEXT DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'PUBLISHED', 'CANCELLED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_post_drafts_user_id ON public.post_drafts(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_user_id ON public.scheduled_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_scheduled_for ON public.scheduled_posts(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_status ON public.scheduled_posts(status);

-- Enable RLS
ALTER TABLE public.post_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_posts ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can manage their own drafts" ON public.post_drafts
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own scheduled posts" ON public.scheduled_posts
    FOR ALL USING (auth.uid() = user_id);
