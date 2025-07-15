
-- Create moderation_logs table
CREATE TABLE IF NOT EXISTS public.moderation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content_type VARCHAR(50) NOT NULL,
    content TEXT,
    image_url TEXT,
    video_url TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'pending_review',
    risk_score INTEGER NOT NULL DEFAULT 0,
    flags TEXT[] DEFAULT ARRAY[]::TEXT[],
    reason TEXT,
    requires_human_review BOOLEAN DEFAULT FALSE,
    moderated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    human_reviewer_id UUID REFERENCES public.profiles(id)
);

-- Create human_review_queue table
CREATE TABLE IF NOT EXISTS public.human_review_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content_type VARCHAR(50) NOT NULL,
    content TEXT,
    image_url TEXT,
    video_url TEXT,
    post_id UUID REFERENCES public.feed_posts(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'pending_review',
    risk_score INTEGER NOT NULL DEFAULT 0,
    flags TEXT[] DEFAULT ARRAY[]::TEXT[],
    reason TEXT,
    priority VARCHAR(20) DEFAULT 'medium',
    queued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    review_status VARCHAR(20) DEFAULT 'pending',
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewer_id UUID REFERENCES public.profiles(id),
    reviewer_reason TEXT,
    reviewer_suggestions TEXT[] DEFAULT ARRAY[]::TEXT[]
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_moderation_logs_user_id ON public.moderation_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_moderation_logs_status ON public.moderation_logs(status);
CREATE INDEX IF NOT EXISTS idx_moderation_logs_moderated_at ON public.moderation_logs(moderated_at);
CREATE INDEX IF NOT EXISTS idx_moderation_logs_risk_score ON public.moderation_logs(risk_score);

CREATE INDEX IF NOT EXISTS idx_human_review_queue_user_id ON public.human_review_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_human_review_queue_status ON public.human_review_queue(status);
CREATE INDEX IF NOT EXISTS idx_human_review_queue_priority ON public.human_review_queue(priority);
CREATE INDEX IF NOT EXISTS idx_human_review_queue_queued_at ON public.human_review_queue(queued_at);
CREATE INDEX IF NOT EXISTS idx_human_review_queue_review_status ON public.human_review_queue(review_status);

-- Enable RLS
ALTER TABLE public.moderation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.human_review_queue ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for moderation_logs
CREATE POLICY "Users can view their own moderation logs" ON public.moderation_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all moderation logs" ON public.moderation_logs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create RLS policies for human_review_queue
CREATE POLICY "Users can view their own review queue items" ON public.human_review_queue
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all review queue items" ON public.human_review_queue
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Grant necessary permissions
GRANT SELECT, INSERT ON public.moderation_logs TO authenticated;
GRANT SELECT, INSERT ON public.human_review_queue TO authenticated;
GRANT ALL ON public.moderation_logs TO service_role;
GRANT ALL ON public.human_review_queue TO service_role;
