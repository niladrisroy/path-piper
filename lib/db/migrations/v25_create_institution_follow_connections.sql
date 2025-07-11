
-- Create institution follow connections table
CREATE TABLE institution_follow_connections (
  id BIGSERIAL PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  UNIQUE(sender_id, receiver_id)
);

-- Add indexes for better performance
CREATE INDEX idx_institution_follow_sender ON institution_follow_connections(sender_id);
CREATE INDEX idx_institution_follow_receiver ON institution_follow_connections(receiver_id);

-- Enable RLS
ALTER TABLE institution_follow_connections ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own follow connections" 
  ON institution_follow_connections FOR SELECT 
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can create their own follow connections" 
  ON institution_follow_connections FOR INSERT 
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can delete their own follow connections" 
  ON institution_follow_connections FOR DELETE 
  USING (auth.uid() = sender_id);
