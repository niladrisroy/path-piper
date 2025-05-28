
-- Supabase Seed Script for Interests and Skills
-- Run this directly in the Supabase SQL editor

-- Create interest_categories table
CREATE TABLE IF NOT EXISTS interest_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  age_group TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create interests table
CREATE TABLE IF NOT EXISTS interests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category_id UUID NOT NULL REFERENCES interest_categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create skill_categories table
CREATE TABLE IF NOT EXISTS skill_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  age_group TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create skills table
CREATE TABLE IF NOT EXISTS skills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category_id UUID NOT NULL REFERENCES skill_categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clear existing data (optional - remove these lines if you want to preserve existing data)
TRUNCATE TABLE interests, interest_categories, skills, skill_categories CASCADE;

-- Insert Interest Categories and Interests

-- Early Childhood Interest Categories
INSERT INTO interest_categories (name, age_group) VALUES 
('Fun Activities', 'early_childhood'),
('Learning Topics', 'early_childhood'),
('Outdoor Activities', 'early_childhood');

-- Early Childhood Interests
INSERT INTO interests (name, category_id) SELECT 'Drawing', id FROM interest_categories WHERE name = 'Fun Activities' AND age_group = 'early_childhood';
INSERT INTO interests (name, category_id) SELECT 'Coloring', id FROM interest_categories WHERE name = 'Fun Activities' AND age_group = 'early_childhood';
INSERT INTO interests (name, category_id) SELECT 'Singing', id FROM interest_categories WHERE name = 'Fun Activities' AND age_group = 'early_childhood';
INSERT INTO interests (name, category_id) SELECT 'Dancing', id FROM interest_categories WHERE name = 'Fun Activities' AND age_group = 'early_childhood';
INSERT INTO interests (name, category_id) SELECT 'Storytelling', id FROM interest_categories WHERE name = 'Fun Activities' AND age_group = 'early_childhood';
INSERT INTO interests (name, category_id) SELECT 'Playing with Toys', id FROM interest_categories WHERE name = 'Fun Activities' AND age_group = 'early_childhood';
INSERT INTO interests (name, category_id) SELECT 'Building Blocks', id FROM interest_categories WHERE name = 'Fun Activities' AND age_group = 'early_childhood';
INSERT INTO interests (name, category_id) SELECT 'Pretend Play', id FROM interest_categories WHERE name = 'Fun Activities' AND age_group = 'early_childhood';

INSERT INTO interests (name, category_id) SELECT 'Animals', id FROM interest_categories WHERE name = 'Learning Topics' AND age_group = 'early_childhood';
INSERT INTO interests (name, category_id) SELECT 'Dinosaurs', id FROM interest_categories WHERE name = 'Learning Topics' AND age_group = 'early_childhood';
INSERT INTO interests (name, category_id) SELECT 'Space', id FROM interest_categories WHERE name = 'Learning Topics' AND age_group = 'early_childhood';
INSERT INTO interests (name, category_id) SELECT 'Nature', id FROM interest_categories WHERE name = 'Learning Topics' AND age_group = 'early_childhood';
INSERT INTO interests (name, category_id) SELECT 'Shapes', id FROM interest_categories WHERE name = 'Learning Topics' AND age_group = 'early_childhood';
INSERT INTO interests (name, category_id) SELECT 'Colors', id FROM interest_categories WHERE name = 'Learning Topics' AND age_group = 'early_childhood';
INSERT INTO interests (name, category_id) SELECT 'Numbers', id FROM interest_categories WHERE name = 'Learning Topics' AND age_group = 'early_childhood';
INSERT INTO interests (name, category_id) SELECT 'Letters', id FROM interest_categories WHERE name = 'Learning Topics' AND age_group = 'early_childhood';
INSERT INTO interests (name, category_id) SELECT 'Music', id FROM interest_categories WHERE name = 'Learning Topics' AND age_group = 'early_childhood';

INSERT INTO interests (name, category_id) SELECT 'Playing Outside', id FROM interest_categories WHERE name = 'Outdoor Activities' AND age_group = 'early_childhood';
INSERT INTO interests (name, category_id) SELECT 'Playground', id FROM interest_categories WHERE name = 'Outdoor Activities' AND age_group = 'early_childhood';
INSERT INTO interests (name, category_id) SELECT 'Swimming', id FROM interest_categories WHERE name = 'Outdoor Activities' AND age_group = 'early_childhood';
INSERT INTO interests (name, category_id) SELECT 'Running', id FROM interest_categories WHERE name = 'Outdoor Activities' AND age_group = 'early_childhood';
INSERT INTO interests (name, category_id) SELECT 'Ball Games', id FROM interest_categories WHERE name = 'Outdoor Activities' AND age_group = 'early_childhood';
INSERT INTO interests (name, category_id) SELECT 'Nature Walks', id FROM interest_categories WHERE name = 'Outdoor Activities' AND age_group = 'early_childhood';
INSERT INTO interests (name, category_id) SELECT 'Gardening', id FROM interest_categories WHERE name = 'Outdoor Activities' AND age_group = 'early_childhood';

-- Elementary Interest Categories
INSERT INTO interest_categories (name, age_group) VALUES 
('School Subjects', 'elementary'),
('Fun & Games', 'elementary'),
('Creative Activities', 'elementary'),
('Science & Discovery', 'elementary');

-- Elementary Interests
INSERT INTO interests (name, category_id) SELECT 'Reading', id FROM interest_categories WHERE name = 'School Subjects' AND age_group = 'elementary';
INSERT INTO interests (name, category_id) SELECT 'Writing', id FROM interest_categories WHERE name = 'School Subjects' AND age_group = 'elementary';
INSERT INTO interests (name, category_id) SELECT 'Math', id FROM interest_categories WHERE name = 'School Subjects' AND age_group = 'elementary';
INSERT INTO interests (name, category_id) SELECT 'Science', id FROM interest_categories WHERE name = 'School Subjects' AND age_group = 'elementary';
INSERT INTO interests (name, category_id) SELECT 'Art', id FROM interest_categories WHERE name = 'School Subjects' AND age_group = 'elementary';
INSERT INTO interests (name, category_id) SELECT 'Music', id FROM interest_categories WHERE name = 'School Subjects' AND age_group = 'elementary';
INSERT INTO interests (name, category_id) SELECT 'Physical Education', id FROM interest_categories WHERE name = 'School Subjects' AND age_group = 'elementary';
INSERT INTO interests (name, category_id) SELECT 'Social Studies', id FROM interest_categories WHERE name = 'School Subjects' AND age_group = 'elementary';

INSERT INTO interests (name, category_id) SELECT 'Board Games', id FROM interest_categories WHERE name = 'Fun & Games' AND age_group = 'elementary';
INSERT INTO interests (name, category_id) SELECT 'Card Games', id FROM interest_categories WHERE name = 'Fun & Games' AND age_group = 'elementary';
INSERT INTO interests (name, category_id) SELECT 'Video Games', id FROM interest_categories WHERE name = 'Fun & Games' AND age_group = 'elementary';
INSERT INTO interests (name, category_id) SELECT 'Puzzles', id FROM interest_categories WHERE name = 'Fun & Games' AND age_group = 'elementary';
INSERT INTO interests (name, category_id) SELECT 'Sports', id FROM interest_categories WHERE name = 'Fun & Games' AND age_group = 'elementary';
INSERT INTO interests (name, category_id) SELECT 'Crafts', id FROM interest_categories WHERE name = 'Fun & Games' AND age_group = 'elementary';
INSERT INTO interests (name, category_id) SELECT 'Collecting', id FROM interest_categories WHERE name = 'Fun & Games' AND age_group = 'elementary';
INSERT INTO interests (name, category_id) SELECT 'Building Models', id FROM interest_categories WHERE name = 'Fun & Games' AND age_group = 'elementary';

INSERT INTO interests (name, category_id) SELECT 'Drawing', id FROM interest_categories WHERE name = 'Creative Activities' AND age_group = 'elementary';
INSERT INTO interests (name, category_id) SELECT 'Painting', id FROM interest_categories WHERE name = 'Creative Activities' AND age_group = 'elementary';
INSERT INTO interests (name, category_id) SELECT 'Crafting', id FROM interest_categories WHERE name = 'Creative Activities' AND age_group = 'elementary';
INSERT INTO interests (name, category_id) SELECT 'Singing', id FROM interest_categories WHERE name = 'Creative Activities' AND age_group = 'elementary';
INSERT INTO interests (name, category_id) SELECT 'Dancing', id FROM interest_categories WHERE name = 'Creative Activities' AND age_group = 'elementary';
INSERT INTO interests (name, category_id) SELECT 'Acting', id FROM interest_categories WHERE name = 'Creative Activities' AND age_group = 'elementary';
INSERT INTO interests (name, category_id) SELECT 'Storytelling', id FROM interest_categories WHERE name = 'Creative Activities' AND age_group = 'elementary';
INSERT INTO interests (name, category_id) SELECT 'Photography', id FROM interest_categories WHERE name = 'Creative Activities' AND age_group = 'elementary';

INSERT INTO interests (name, category_id) SELECT 'Animals', id FROM interest_categories WHERE name = 'Science & Discovery' AND age_group = 'elementary';
INSERT INTO interests (name, category_id) SELECT 'Plants', id FROM interest_categories WHERE name = 'Science & Discovery' AND age_group = 'elementary';
INSERT INTO interests (name, category_id) SELECT 'Space', id FROM interest_categories WHERE name = 'Science & Discovery' AND age_group = 'elementary';
INSERT INTO interests (name, category_id) SELECT 'Dinosaurs', id FROM interest_categories WHERE name = 'Science & Discovery' AND age_group = 'elementary';
INSERT INTO interests (name, category_id) SELECT 'Robots', id FROM interest_categories WHERE name = 'Science & Discovery' AND age_group = 'elementary';
INSERT INTO interests (name, category_id) SELECT 'Experiments', id FROM interest_categories WHERE name = 'Science & Discovery' AND age_group = 'elementary';
INSERT INTO interests (name, category_id) SELECT 'Nature', id FROM interest_categories WHERE name = 'Science & Discovery' AND age_group = 'elementary';
INSERT INTO interests (name, category_id) SELECT 'Weather', id FROM interest_categories WHERE name = 'Science & Discovery' AND age_group = 'elementary';
INSERT INTO interests (name, category_id) SELECT 'Oceans', id FROM interest_categories WHERE name = 'Science & Discovery' AND age_group = 'elementary';

-- Middle School Interest Categories
INSERT INTO interest_categories (name, age_group) VALUES 
('Academic Subjects', 'middle_school'),
('Sports & Activities', 'middle_school'),
('Creative Arts', 'middle_school'),
('Technology', 'middle_school'),
('Social & Community', 'middle_school');

-- Middle School Interests
INSERT INTO interests (name, category_id) SELECT 'Math', id FROM interest_categories WHERE name = 'Academic Subjects' AND age_group = 'middle_school';
INSERT INTO interests (name, category_id) SELECT 'Science', id FROM interest_categories WHERE name = 'Academic Subjects' AND age_group = 'middle_school';
INSERT INTO interests (name, category_id) SELECT 'Language Arts', id FROM interest_categories WHERE name = 'Academic Subjects' AND age_group = 'middle_school';
INSERT INTO interests (name, category_id) SELECT 'Social Studies', id FROM interest_categories WHERE name = 'Academic Subjects' AND age_group = 'middle_school';
INSERT INTO interests (name, category_id) SELECT 'Foreign Languages', id FROM interest_categories WHERE name = 'Academic Subjects' AND age_group = 'middle_school';
INSERT INTO interests (name, category_id) SELECT 'Computer Science', id FROM interest_categories WHERE name = 'Academic Subjects' AND age_group = 'middle_school';
INSERT INTO interests (name, category_id) SELECT 'Art', id FROM interest_categories WHERE name = 'Academic Subjects' AND age_group = 'middle_school';
INSERT INTO interests (name, category_id) SELECT 'Music', id FROM interest_categories WHERE name = 'Academic Subjects' AND age_group = 'middle_school';

INSERT INTO interests (name, category_id) SELECT 'Team Sports', id FROM interest_categories WHERE name = 'Sports & Activities' AND age_group = 'middle_school';
INSERT INTO interests (name, category_id) SELECT 'Individual Sports', id FROM interest_categories WHERE name = 'Sports & Activities' AND age_group = 'middle_school';
INSERT INTO interests (name, category_id) SELECT 'Martial Arts', id FROM interest_categories WHERE name = 'Sports & Activities' AND age_group = 'middle_school';
INSERT INTO interests (name, category_id) SELECT 'Dance', id FROM interest_categories WHERE name = 'Sports & Activities' AND age_group = 'middle_school';
INSERT INTO interests (name, category_id) SELECT 'Swimming', id FROM interest_categories WHERE name = 'Sports & Activities' AND age_group = 'middle_school';
INSERT INTO interests (name, category_id) SELECT 'Running', id FROM interest_categories WHERE name = 'Sports & Activities' AND age_group = 'middle_school';
INSERT INTO interests (name, category_id) SELECT 'Cycling', id FROM interest_categories WHERE name = 'Sports & Activities' AND age_group = 'middle_school';
INSERT INTO interests (name, category_id) SELECT 'Skateboarding', id FROM interest_categories WHERE name = 'Sports & Activities' AND age_group = 'middle_school';

INSERT INTO interests (name, category_id) SELECT 'Drawing', id FROM interest_categories WHERE name = 'Creative Arts' AND age_group = 'middle_school';
INSERT INTO interests (name, category_id) SELECT 'Painting', id FROM interest_categories WHERE name = 'Creative Arts' AND age_group = 'middle_school';
INSERT INTO interests (name, category_id) SELECT 'Digital Art', id FROM interest_categories WHERE name = 'Creative Arts' AND age_group = 'middle_school';
INSERT INTO interests (name, category_id) SELECT 'Photography', id FROM interest_categories WHERE name = 'Creative Arts' AND age_group = 'middle_school';
INSERT INTO interests (name, category_id) SELECT 'Video Creation', id FROM interest_categories WHERE name = 'Creative Arts' AND age_group = 'middle_school';
INSERT INTO interests (name, category_id) SELECT 'Music Production', id FROM interest_categories WHERE name = 'Creative Arts' AND age_group = 'middle_school';
INSERT INTO interests (name, category_id) SELECT 'Creative Writing', id FROM interest_categories WHERE name = 'Creative Arts' AND age_group = 'middle_school';
INSERT INTO interests (name, category_id) SELECT 'Drama', id FROM interest_categories WHERE name = 'Creative Arts' AND age_group = 'middle_school';

INSERT INTO interests (name, category_id) SELECT 'Coding', id FROM interest_categories WHERE name = 'Technology' AND age_group = 'middle_school';
INSERT INTO interests (name, category_id) SELECT 'Robotics', id FROM interest_categories WHERE name = 'Technology' AND age_group = 'middle_school';
INSERT INTO interests (name, category_id) SELECT 'Game Design', id FROM interest_categories WHERE name = 'Technology' AND age_group = 'middle_school';
INSERT INTO interests (name, category_id) SELECT '3D Printing', id FROM interest_categories WHERE name = 'Technology' AND age_group = 'middle_school';
INSERT INTO interests (name, category_id) SELECT 'Animation', id FROM interest_categories WHERE name = 'Technology' AND age_group = 'middle_school';
INSERT INTO interests (name, category_id) SELECT 'Web Design', id FROM interest_categories WHERE name = 'Technology' AND age_group = 'middle_school';
INSERT INTO interests (name, category_id) SELECT 'App Development', id FROM interest_categories WHERE name = 'Technology' AND age_group = 'middle_school';
INSERT INTO interests (name, category_id) SELECT 'Digital Media', id FROM interest_categories WHERE name = 'Technology' AND age_group = 'middle_school';

INSERT INTO interests (name, category_id) SELECT 'Volunteering', id FROM interest_categories WHERE name = 'Social & Community' AND age_group = 'middle_school';
INSERT INTO interests (name, category_id) SELECT 'Environmental Projects', id FROM interest_categories WHERE name = 'Social & Community' AND age_group = 'middle_school';
INSERT INTO interests (name, category_id) SELECT 'Student Government', id FROM interest_categories WHERE name = 'Social & Community' AND age_group = 'middle_school';
INSERT INTO interests (name, category_id) SELECT 'Debate Club', id FROM interest_categories WHERE name = 'Social & Community' AND age_group = 'middle_school';
INSERT INTO interests (name, category_id) SELECT 'School Newspaper', id FROM interest_categories WHERE name = 'Social & Community' AND age_group = 'middle_school';
INSERT INTO interests (name, category_id) SELECT 'Community Service', id FROM interest_categories WHERE name = 'Social & Community' AND age_group = 'middle_school';

-- High School Interest Categories
INSERT INTO interest_categories (name, age_group) VALUES 
('Academic Subjects', 'high_school'),
('Arts & Creativity', 'high_school'),
('Technology', 'high_school'),
('Career Exploration', 'high_school'),
('Social Impact', 'high_school');

-- High School Interests
INSERT INTO interests (name, category_id) SELECT 'Mathematics', id FROM interest_categories WHERE name = 'Academic Subjects' AND age_group = 'high_school';
INSERT INTO interests (name, category_id) SELECT 'Physics', id FROM interest_categories WHERE name = 'Academic Subjects' AND age_group = 'high_school';
INSERT INTO interests (name, category_id) SELECT 'Chemistry', id FROM interest_categories WHERE name = 'Academic Subjects' AND age_group = 'high_school';
INSERT INTO interests (name, category_id) SELECT 'Biology', id FROM interest_categories WHERE name = 'Academic Subjects' AND age_group = 'high_school';
INSERT INTO interests (name, category_id) SELECT 'Literature', id FROM interest_categories WHERE name = 'Academic Subjects' AND age_group = 'high_school';
INSERT INTO interests (name, category_id) SELECT 'History', id FROM interest_categories WHERE name = 'Academic Subjects' AND age_group = 'high_school';
INSERT INTO interests (name, category_id) SELECT 'Geography', id FROM interest_categories WHERE name = 'Academic Subjects' AND age_group = 'high_school';
INSERT INTO interests (name, category_id) SELECT 'Economics', id FROM interest_categories WHERE name = 'Academic Subjects' AND age_group = 'high_school';
INSERT INTO interests (name, category_id) SELECT 'Psychology', id FROM interest_categories WHERE name = 'Academic Subjects' AND age_group = 'high_school';
INSERT INTO interests (name, category_id) SELECT 'Computer Science', id FROM interest_categories WHERE name = 'Academic Subjects' AND age_group = 'high_school';

INSERT INTO interests (name, category_id) SELECT 'Visual Arts', id FROM interest_categories WHERE name = 'Arts & Creativity' AND age_group = 'high_school';
INSERT INTO interests (name, category_id) SELECT 'Music', id FROM interest_categories WHERE name = 'Arts & Creativity' AND age_group = 'high_school';
INSERT INTO interests (name, category_id) SELECT 'Theater', id FROM interest_categories WHERE name = 'Arts & Creativity' AND age_group = 'high_school';
INSERT INTO interests (name, category_id) SELECT 'Film Production', id FROM interest_categories WHERE name = 'Arts & Creativity' AND age_group = 'high_school';
INSERT INTO interests (name, category_id) SELECT 'Creative Writing', id FROM interest_categories WHERE name = 'Arts & Creativity' AND age_group = 'high_school';
INSERT INTO interests (name, category_id) SELECT 'Photography', id FROM interest_categories WHERE name = 'Arts & Creativity' AND age_group = 'high_school';
INSERT INTO interests (name, category_id) SELECT 'Digital Design', id FROM interest_categories WHERE name = 'Arts & Creativity' AND age_group = 'high_school';
INSERT INTO interests (name, category_id) SELECT 'Fashion Design', id FROM interest_categories WHERE name = 'Arts & Creativity' AND age_group = 'high_school';

INSERT INTO interests (name, category_id) SELECT 'Programming', id FROM interest_categories WHERE name = 'Technology' AND age_group = 'high_school';
INSERT INTO interests (name, category_id) SELECT 'Web Development', id FROM interest_categories WHERE name = 'Technology' AND age_group = 'high_school';
INSERT INTO interests (name, category_id) SELECT 'App Development', id FROM interest_categories WHERE name = 'Technology' AND age_group = 'high_school';
INSERT INTO interests (name, category_id) SELECT 'Robotics', id FROM interest_categories WHERE name = 'Technology' AND age_group = 'high_school';
INSERT INTO interests (name, category_id) SELECT 'Artificial Intelligence', id FROM interest_categories WHERE name = 'Technology' AND age_group = 'high_school';
INSERT INTO interests (name, category_id) SELECT 'Game Development', id FROM interest_categories WHERE name = 'Technology' AND age_group = 'high_school';
INSERT INTO interests (name, category_id) SELECT 'Cybersecurity', id FROM interest_categories WHERE name = 'Technology' AND age_group = 'high_school';
INSERT INTO interests (name, category_id) SELECT 'Data Science', id FROM interest_categories WHERE name = 'Technology' AND age_group = 'high_school';

INSERT INTO interests (name, category_id) SELECT 'Business', id FROM interest_categories WHERE name = 'Career Exploration' AND age_group = 'high_school';
INSERT INTO interests (name, category_id) SELECT 'Engineering', id FROM interest_categories WHERE name = 'Career Exploration' AND age_group = 'high_school';
INSERT INTO interests (name, category_id) SELECT 'Medicine', id FROM interest_categories WHERE name = 'Career Exploration' AND age_group = 'high_school';
INSERT INTO interests (name, category_id) SELECT 'Law', id FROM interest_categories WHERE name = 'Career Exploration' AND age_group = 'high_school';
INSERT INTO interests (name, category_id) SELECT 'Education', id FROM interest_categories WHERE name = 'Career Exploration' AND age_group = 'high_school';
INSERT INTO interests (name, category_id) SELECT 'Journalism', id FROM interest_categories WHERE name = 'Career Exploration' AND age_group = 'high_school';
INSERT INTO interests (name, category_id) SELECT 'Marketing', id FROM interest_categories WHERE name = 'Career Exploration' AND age_group = 'high_school';
INSERT INTO interests (name, category_id) SELECT 'Finance', id FROM interest_categories WHERE name = 'Career Exploration' AND age_group = 'high_school';
INSERT INTO interests (name, category_id) SELECT 'Architecture', id FROM interest_categories WHERE name = 'Career Exploration' AND age_group = 'high_school';

INSERT INTO interests (name, category_id) SELECT 'Environmental Activism', id FROM interest_categories WHERE name = 'Social Impact' AND age_group = 'high_school';
INSERT INTO interests (name, category_id) SELECT 'Social Justice', id FROM interest_categories WHERE name = 'Social Impact' AND age_group = 'high_school';
INSERT INTO interests (name, category_id) SELECT 'Community Service', id FROM interest_categories WHERE name = 'Social Impact' AND age_group = 'high_school';
INSERT INTO interests (name, category_id) SELECT 'Political Engagement', id FROM interest_categories WHERE name = 'Social Impact' AND age_group = 'high_school';
INSERT INTO interests (name, category_id) SELECT 'Global Issues', id FROM interest_categories WHERE name = 'Social Impact' AND age_group = 'high_school';
INSERT INTO interests (name, category_id) SELECT 'Public Speaking', id FROM interest_categories WHERE name = 'Social Impact' AND age_group = 'high_school';
INSERT INTO interests (name, category_id) SELECT 'Leadership', id FROM interest_categories WHERE name = 'Social Impact' AND age_group = 'high_school';

-- Young Adult Interest Categories
INSERT INTO interest_categories (name, age_group) VALUES 
('Academic Subjects', 'young_adult'),
('Arts & Creativity', 'young_adult'),
('Technology', 'young_adult'),
('Career Fields', 'young_adult'),
('Personal Development', 'young_adult');

-- Young Adult Interests
INSERT INTO interests (name, category_id) SELECT 'Mathematics', id FROM interest_categories WHERE name = 'Academic Subjects' AND age_group = 'young_adult';
INSERT INTO interests (name, category_id) SELECT 'Physics', id FROM interest_categories WHERE name = 'Academic Subjects' AND age_group = 'young_adult';
INSERT INTO interests (name, category_id) SELECT 'Chemistry', id FROM interest_categories WHERE name = 'Academic Subjects' AND age_group = 'young_adult';
INSERT INTO interests (name, category_id) SELECT 'Biology', id FROM interest_categories WHERE name = 'Academic Subjects' AND age_group = 'young_adult';
INSERT INTO interests (name, category_id) SELECT 'Computer Science', id FROM interest_categories WHERE name = 'Academic Subjects' AND age_group = 'young_adult';
INSERT INTO interests (name, category_id) SELECT 'Literature', id FROM interest_categories WHERE name = 'Academic Subjects' AND age_group = 'young_adult';
INSERT INTO interests (name, category_id) SELECT 'History', id FROM interest_categories WHERE name = 'Academic Subjects' AND age_group = 'young_adult';
INSERT INTO interests (name, category_id) SELECT 'Geography', id FROM interest_categories WHERE name = 'Academic Subjects' AND age_group = 'young_adult';
INSERT INTO interests (name, category_id) SELECT 'Economics', id FROM interest_categories WHERE name = 'Academic Subjects' AND age_group = 'young_adult';
INSERT INTO interests (name, category_id) SELECT 'Psychology', id FROM interest_categories WHERE name = 'Academic Subjects' AND age_group = 'young_adult';

INSERT INTO interests (name, category_id) SELECT 'Drawing', id FROM interest_categories WHERE name = 'Arts & Creativity' AND age_group = 'young_adult';
INSERT INTO interests (name, category_id) SELECT 'Painting', id FROM interest_categories WHERE name = 'Arts & Creativity' AND age_group = 'young_adult';
INSERT INTO interests (name, category_id) SELECT 'Photography', id FROM interest_categories WHERE name = 'Arts & Creativity' AND age_group = 'young_adult';
INSERT INTO interests (name, category_id) SELECT 'Music', id FROM interest_categories WHERE name = 'Arts & Creativity' AND age_group = 'young_adult';
INSERT INTO interests (name, category_id) SELECT 'Dance', id FROM interest_categories WHERE name = 'Arts & Creativity' AND age_group = 'young_adult';
INSERT INTO interests (name, category_id) SELECT 'Theater', id FROM interest_categories WHERE name = 'Arts & Creativity' AND age_group = 'young_adult';
INSERT INTO interests (name, category_id) SELECT 'Creative Writing', id FROM interest_categories WHERE name = 'Arts & Creativity' AND age_group = 'young_adult';
INSERT INTO interests (name, category_id) SELECT 'Film Making', id FROM interest_categories WHERE name = 'Arts & Creativity' AND age_group = 'young_adult';
INSERT INTO interests (name, category_id) SELECT 'Design', id FROM interest_categories WHERE name = 'Arts & Creativity' AND age_group = 'young_adult';
INSERT INTO interests (name, category_id) SELECT 'Crafts', id FROM interest_categories WHERE name = 'Arts & Creativity' AND age_group = 'young_adult';

INSERT INTO interests (name, category_id) SELECT 'Programming', id FROM interest_categories WHERE name = 'Technology' AND age_group = 'young_adult';
INSERT INTO interests (name, category_id) SELECT 'Web Development', id FROM interest_categories WHERE name = 'Technology' AND age_group = 'young_adult';
INSERT INTO interests (name, category_id) SELECT 'Mobile Apps', id FROM interest_categories WHERE name = 'Technology' AND age_group = 'young_adult';
INSERT INTO interests (name, category_id) SELECT 'Artificial Intelligence', id FROM interest_categories WHERE name = 'Technology' AND age_group = 'young_adult';
INSERT INTO interests (name, category_id) SELECT 'Robotics', id FROM interest_categories WHERE name = 'Technology' AND age_group = 'young_adult';
INSERT INTO interests (name, category_id) SELECT 'Game Development', id FROM interest_categories WHERE name = 'Technology' AND age_group = 'young_adult';
INSERT INTO interests (name, category_id) SELECT 'Cybersecurity', id FROM interest_categories WHERE name = 'Technology' AND age_group = 'young_adult';
INSERT INTO interests (name, category_id) SELECT 'Data Science', id FROM interest_categories WHERE name = 'Technology' AND age_group = 'young_adult';
INSERT INTO interests (name, category_id) SELECT 'Virtual Reality', id FROM interest_categories WHERE name = 'Technology' AND age_group = 'young_adult';
INSERT INTO interests (name, category_id) SELECT 'Blockchain', id FROM interest_categories WHERE name = 'Technology' AND age_group = 'young_adult';

INSERT INTO interests (name, category_id) SELECT 'Medicine', id FROM interest_categories WHERE name = 'Career Fields' AND age_group = 'young_adult';
INSERT INTO interests (name, category_id) SELECT 'Engineering', id FROM interest_categories WHERE name = 'Career Fields' AND age_group = 'young_adult';
INSERT INTO interests (name, category_id) SELECT 'Law', id FROM interest_categories WHERE name = 'Career Fields' AND age_group = 'young_adult';
INSERT INTO interests (name, category_id) SELECT 'Business', id FROM interest_categories WHERE name = 'Career Fields' AND age_group = 'young_adult';
INSERT INTO interests (name, category_id) SELECT 'Education', id FROM interest_categories WHERE name = 'Career Fields' AND age_group = 'young_adult';
INSERT INTO interests (name, category_id) SELECT 'Research', id FROM interest_categories WHERE name = 'Career Fields' AND age_group = 'young_adult';
INSERT INTO interests (name, category_id) SELECT 'Social Work', id FROM interest_categories WHERE name = 'Career Fields' AND age_group = 'young_adult';
INSERT INTO interests (name, category_id) SELECT 'Environmental Science', id FROM interest_categories WHERE name = 'Career Fields' AND age_group = 'young_adult';
INSERT INTO interests (name, category_id) SELECT 'Journalism', id FROM interest_categories WHERE name = 'Career Fields' AND age_group = 'young_adult';
INSERT INTO interests (name, category_id) SELECT 'Architecture', id FROM interest_categories WHERE name = 'Career Fields' AND age_group = 'young_adult';

INSERT INTO interests (name, category_id) SELECT 'Entrepreneurship', id FROM interest_categories WHERE name = 'Personal Development' AND age_group = 'young_adult';
INSERT INTO interests (name, category_id) SELECT 'Leadership', id FROM interest_categories WHERE name = 'Personal Development' AND age_group = 'young_adult';
INSERT INTO interests (name, category_id) SELECT 'Public Speaking', id FROM interest_categories WHERE name = 'Personal Development' AND age_group = 'young_adult';
INSERT INTO interests (name, category_id) SELECT 'Financial Literacy', id FROM interest_categories WHERE name = 'Personal Development' AND age_group = 'young_adult';
INSERT INTO interests (name, category_id) SELECT 'Productivity', id FROM interest_categories WHERE name = 'Personal Development' AND age_group = 'young_adult';
INSERT INTO interests (name, category_id) SELECT 'Mindfulness', id FROM interest_categories WHERE name = 'Personal Development' AND age_group = 'young_adult';
INSERT INTO interests (name, category_id) SELECT 'Fitness', id FROM interest_categories WHERE name = 'Personal Development' AND age_group = 'young_adult';
INSERT INTO interests (name, category_id) SELECT 'Nutrition', id FROM interest_categories WHERE name = 'Personal Development' AND age_group = 'young_adult';
INSERT INTO interests (name, category_id) SELECT 'Travel', id FROM interest_categories WHERE name = 'Personal Development' AND age_group = 'young_adult';
INSERT INTO interests (name, category_id) SELECT 'Languages', id FROM interest_categories WHERE name = 'Personal Development' AND age_group = 'young_adult';

-- Insert Skill Categories and Skills

-- Early Childhood Skill Categories
INSERT INTO skill_categories (name, age_group) VALUES 
('Basic Skills', 'early_childhood'),
('Social Skills', 'early_childhood'),
('Physical Skills', 'early_childhood');

-- Early Childhood Skills
INSERT INTO skills (name, category_id) SELECT 'Counting', id FROM skill_categories WHERE name = 'Basic Skills' AND age_group = 'early_childhood';
INSERT INTO skills (name, category_id) SELECT 'Recognizing Letters', id FROM skill_categories WHERE name = 'Basic Skills' AND age_group = 'early_childhood';
INSERT INTO skills (name, category_id) SELECT 'Recognizing Colors', id FROM skill_categories WHERE name = 'Basic Skills' AND age_group = 'early_childhood';
INSERT INTO skills (name, category_id) SELECT 'Recognizing Shapes', id FROM skill_categories WHERE name = 'Basic Skills' AND age_group = 'early_childhood';
INSERT INTO skills (name, category_id) SELECT 'Drawing', id FROM skill_categories WHERE name = 'Basic Skills' AND age_group = 'early_childhood';
INSERT INTO skills (name, category_id) SELECT 'Coloring', id FROM skill_categories WHERE name = 'Basic Skills' AND age_group = 'early_childhood';
INSERT INTO skills (name, category_id) SELECT 'Cutting with Scissors', id FROM skill_categories WHERE name = 'Basic Skills' AND age_group = 'early_childhood';
INSERT INTO skills (name, category_id) SELECT 'Following Instructions', id FROM skill_categories WHERE name = 'Basic Skills' AND age_group = 'early_childhood';

INSERT INTO skills (name, category_id) SELECT 'Sharing', id FROM skill_categories WHERE name = 'Social Skills' AND age_group = 'early_childhood';
INSERT INTO skills (name, category_id) SELECT 'Taking Turns', id FROM skill_categories WHERE name = 'Social Skills' AND age_group = 'early_childhood';
INSERT INTO skills (name, category_id) SELECT 'Listening', id FROM skill_categories WHERE name = 'Social Skills' AND age_group = 'early_childhood';
INSERT INTO skills (name, category_id) SELECT 'Using Manners', id FROM skill_categories WHERE name = 'Social Skills' AND age_group = 'early_childhood';
INSERT INTO skills (name, category_id) SELECT 'Making Friends', id FROM skill_categories WHERE name = 'Social Skills' AND age_group = 'early_childhood';
INSERT INTO skills (name, category_id) SELECT 'Expressing Feelings', id FROM skill_categories WHERE name = 'Social Skills' AND age_group = 'early_childhood';
INSERT INTO skills (name, category_id) SELECT 'Working Together', id FROM skill_categories WHERE name = 'Social Skills' AND age_group = 'early_childhood';

INSERT INTO skills (name, category_id) SELECT 'Running', id FROM skill_categories WHERE name = 'Physical Skills' AND age_group = 'early_childhood';
INSERT INTO skills (name, category_id) SELECT 'Jumping', id FROM skill_categories WHERE name = 'Physical Skills' AND age_group = 'early_childhood';
INSERT INTO skills (name, category_id) SELECT 'Throwing', id FROM skill_categories WHERE name = 'Physical Skills' AND age_group = 'early_childhood';
INSERT INTO skills (name, category_id) SELECT 'Catching', id FROM skill_categories WHERE name = 'Physical Skills' AND age_group = 'early_childhood';
INSERT INTO skills (name, category_id) SELECT 'Balancing', id FROM skill_categories WHERE name = 'Physical Skills' AND age_group = 'early_childhood';
INSERT INTO skills (name, category_id) SELECT 'Climbing', id FROM skill_categories WHERE name = 'Physical Skills' AND age_group = 'early_childhood';
INSERT INTO skills (name, category_id) SELECT 'Dancing', id FROM skill_categories WHERE name = 'Physical Skills' AND age_group = 'early_childhood';
INSERT INTO skills (name, category_id) SELECT 'Riding a Tricycle', id FROM skill_categories WHERE name = 'Physical Skills' AND age_group = 'early_childhood';

-- Elementary Skill Categories
INSERT INTO skill_categories (name, age_group) VALUES 
('Academic Skills', 'elementary'),
('Creative Skills', 'elementary'),
('Physical Skills', 'elementary'),
('Technology Skills', 'elementary'),
('Life Skills', 'elementary');

-- Elementary Skills
INSERT INTO skills (name, category_id) SELECT 'Reading', id FROM skill_categories WHERE name = 'Academic Skills' AND age_group = 'elementary';
INSERT INTO skills (name, category_id) SELECT 'Writing', id FROM skill_categories WHERE name = 'Academic Skills' AND age_group = 'elementary';
INSERT INTO skills (name, category_id) SELECT 'Basic Math', id FROM skill_categories WHERE name = 'Academic Skills' AND age_group = 'elementary';
INSERT INTO skills (name, category_id) SELECT 'Spelling', id FROM skill_categories WHERE name = 'Academic Skills' AND age_group = 'elementary';
INSERT INTO skills (name, category_id) SELECT 'Telling Time', id FROM skill_categories WHERE name = 'Academic Skills' AND age_group = 'elementary';
INSERT INTO skills (name, category_id) SELECT 'Using a Calendar', id FROM skill_categories WHERE name = 'Academic Skills' AND age_group = 'elementary';
INSERT INTO skills (name, category_id) SELECT 'Basic Science', id FROM skill_categories WHERE name = 'Academic Skills' AND age_group = 'elementary';
INSERT INTO skills (name, category_id) SELECT 'Geography', id FROM skill_categories WHERE name = 'Academic Skills' AND age_group = 'elementary';

INSERT INTO skills (name, category_id) SELECT 'Drawing', id FROM skill_categories WHERE name = 'Creative Skills' AND age_group = 'elementary';
INSERT INTO skills (name, category_id) SELECT 'Painting', id FROM skill_categories WHERE name = 'Creative Skills' AND age_group = 'elementary';
INSERT INTO skills (name, category_id) SELECT 'Crafting', id FROM skill_categories WHERE name = 'Creative Skills' AND age_group = 'elementary';
INSERT INTO skills (name, category_id) SELECT 'Singing', id FROM skill_categories WHERE name = 'Creative Skills' AND age_group = 'elementary';
INSERT INTO skills (name, category_id) SELECT 'Playing an Instrument', id FROM skill_categories WHERE name = 'Creative Skills' AND age_group = 'elementary';
INSERT INTO skills (name, category_id) SELECT 'Acting', id FROM skill_categories WHERE name = 'Creative Skills' AND age_group = 'elementary';
INSERT INTO skills (name, category_id) SELECT 'Storytelling', id FROM skill_categories WHERE name = 'Creative Skills' AND age_group = 'elementary';
INSERT INTO skills (name, category_id) SELECT 'Dancing', id FROM skill_categories WHERE name = 'Creative Skills' AND age_group = 'elementary';

INSERT INTO skills (name, category_id) SELECT 'Running', id FROM skill_categories WHERE name = 'Physical Skills' AND age_group = 'elementary';
INSERT INTO skills (name, category_id) SELECT 'Swimming', id FROM skill_categories WHERE name = 'Physical Skills' AND age_group = 'elementary';
INSERT INTO skills (name, category_id) SELECT 'Biking', id FROM skill_categories WHERE name = 'Physical Skills' AND age_group = 'elementary';
INSERT INTO skills (name, category_id) SELECT 'Ball Sports', id FROM skill_categories WHERE name = 'Physical Skills' AND age_group = 'elementary';
INSERT INTO skills (name, category_id) SELECT 'Gymnastics', id FROM skill_categories WHERE name = 'Physical Skills' AND age_group = 'elementary';
INSERT INTO skills (name, category_id) SELECT 'Martial Arts', id FROM skill_categories WHERE name = 'Physical Skills' AND age_group = 'elementary';
INSERT INTO skills (name, category_id) SELECT 'Skating', id FROM skill_categories WHERE name = 'Physical Skills' AND age_group = 'elementary';
INSERT INTO skills (name, category_id) SELECT 'Jumping Rope', id FROM skill_categories WHERE name = 'Physical Skills' AND age_group = 'elementary';

INSERT INTO skills (name, category_id) SELECT 'Using a Computer', id FROM skill_categories WHERE name = 'Technology Skills' AND age_group = 'elementary';
INSERT INTO skills (name, category_id) SELECT 'Basic Typing', id FROM skill_categories WHERE name = 'Technology Skills' AND age_group = 'elementary';
INSERT INTO skills (name, category_id) SELECT 'Internet Safety', id FROM skill_categories WHERE name = 'Technology Skills' AND age_group = 'elementary';
INSERT INTO skills (name, category_id) SELECT 'Educational Games', id FROM skill_categories WHERE name = 'Technology Skills' AND age_group = 'elementary';
INSERT INTO skills (name, category_id) SELECT 'Basic Coding', id FROM skill_categories WHERE name = 'Technology Skills' AND age_group = 'elementary';
INSERT INTO skills (name, category_id) SELECT 'Digital Art', id FROM skill_categories WHERE name = 'Technology Skills' AND age_group = 'elementary';
INSERT INTO skills (name, category_id) SELECT 'Taking Photos', id FROM skill_categories WHERE name = 'Technology Skills' AND age_group = 'elementary';

INSERT INTO skills (name, category_id) SELECT 'Organization', id FROM skill_categories WHERE name = 'Life Skills' AND age_group = 'elementary';
INSERT INTO skills (name, category_id) SELECT 'Following Directions', id FROM skill_categories WHERE name = 'Life Skills' AND age_group = 'elementary';
INSERT INTO skills (name, category_id) SELECT 'Completing Homework', id FROM skill_categories WHERE name = 'Life Skills' AND age_group = 'elementary';
INSERT INTO skills (name, category_id) SELECT 'Basic Cooking', id FROM skill_categories WHERE name = 'Life Skills' AND age_group = 'elementary';
INSERT INTO skills (name, category_id) SELECT 'Cleaning Up', id FROM skill_categories WHERE name = 'Life Skills' AND age_group = 'elementary';
INSERT INTO skills (name, category_id) SELECT 'Pet Care', id FROM skill_categories WHERE name = 'Life Skills' AND age_group = 'elementary';
INSERT INTO skills (name, category_id) SELECT 'Plant Care', id FROM skill_categories WHERE name = 'Life Skills' AND age_group = 'elementary';
INSERT INTO skills (name, category_id) SELECT 'Money Basics', id FROM skill_categories WHERE name = 'Life Skills' AND age_group = 'elementary';

-- Middle School Skill Categories
INSERT INTO skill_categories (name, age_group) VALUES 
('Academic Skills', 'middle_school'),
('Technology Skills', 'middle_school'),
('Creative Skills', 'middle_school'),
('Social Skills', 'middle_school'),
('Life Skills', 'middle_school');

-- Middle School Skills
INSERT INTO skills (name, category_id) SELECT 'Essay Writing', id FROM skill_categories WHERE name = 'Academic Skills' AND age_group = 'middle_school';
INSERT INTO skills (name, category_id) SELECT 'Research', id FROM skill_categories WHERE name = 'Academic Skills' AND age_group = 'middle_school';
INSERT INTO skills (name, category_id) SELECT 'Pre-Algebra', id FROM skill_categories WHERE name = 'Academic Skills' AND age_group = 'middle_school';
INSERT INTO skills (name, category_id) SELECT 'Science Projects', id FROM skill_categories WHERE name = 'Academic Skills' AND age_group = 'middle_school';
INSERT INTO skills (name, category_id) SELECT 'Critical Reading', id FROM skill_categories WHERE name = 'Academic Skills' AND age_group = 'middle_school';
INSERT INTO skills (name, category_id) SELECT 'Note Taking', id FROM skill_categories WHERE name = 'Academic Skills' AND age_group = 'middle_school';
INSERT INTO skills (name, category_id) SELECT 'Study Skills', id FROM skill_categories WHERE name = 'Academic Skills' AND age_group = 'middle_school';
INSERT INTO skills (name, category_id) SELECT 'Presentations', id FROM skill_categories WHERE name = 'Academic Skills' AND age_group = 'middle_school';

INSERT INTO skills (name, category_id) SELECT 'Typing', id FROM skill_categories WHERE name = 'Technology Skills' AND age_group = 'middle_school';
INSERT INTO skills (name, category_id) SELECT 'Digital Research', id FROM skill_categories WHERE name = 'Technology Skills' AND age_group = 'middle_school';
INSERT INTO skills (name, category_id) SELECT 'Basic Coding', id FROM skill_categories WHERE name = 'Technology Skills' AND age_group = 'middle_school';
INSERT INTO skills (name, category_id) SELECT 'Presentation Software', id FROM skill_categories WHERE name = 'Technology Skills' AND age_group = 'middle_school';
INSERT INTO skills (name, category_id) SELECT 'Word Processing', id FROM skill_categories WHERE name = 'Technology Skills' AND age_group = 'middle_school';
INSERT INTO skills (name, category_id) SELECT 'Spreadsheets', id FROM skill_categories WHERE name = 'Technology Skills' AND age_group = 'middle_school';
INSERT INTO skills (name, category_id) SELECT 'Digital Safety', id FROM skill_categories WHERE name = 'Technology Skills' AND age_group = 'middle_school';
INSERT INTO skills (name, category_id) SELECT 'Video Editing', id FROM skill_categories WHERE name = 'Technology Skills' AND age_group = 'middle_school';

INSERT INTO skills (name, category_id) SELECT 'Drawing', id FROM skill_categories WHERE name = 'Creative Skills' AND age_group = 'middle_school';
INSERT INTO skills (name, category_id) SELECT 'Painting', id FROM skill_categories WHERE name = 'Creative Skills' AND age_group = 'middle_school';
INSERT INTO skills (name, category_id) SELECT 'Digital Art', id FROM skill_categories WHERE name = 'Creative Skills' AND age_group = 'middle_school';
INSERT INTO skills (name, category_id) SELECT 'Photography', id FROM skill_categories WHERE name = 'Creative Skills' AND age_group = 'middle_school';
INSERT INTO skills (name, category_id) SELECT 'Creative Writing', id FROM skill_categories WHERE name = 'Creative Skills' AND age_group = 'middle_school';
INSERT INTO skills (name, category_id) SELECT 'Music Performance', id FROM skill_categories WHERE name = 'Creative Skills' AND age_group = 'middle_school';
INSERT INTO skills (name, category_id) SELECT 'Drama', id FROM skill_categories WHERE name = 'Creative Skills' AND age_group = 'middle_school';
INSERT INTO skills (name, category_id) SELECT 'Crafting', id FROM skill_categories WHERE name = 'Creative Skills' AND age_group = 'middle_school';

INSERT INTO skills (name, category_id) SELECT 'Communication', id FROM skill_categories WHERE name = 'Social Skills' AND age_group = 'middle_school';
INSERT INTO skills (name, category_id) SELECT 'Teamwork', id FROM skill_categories WHERE name = 'Social Skills' AND age_group = 'middle_school';
INSERT INTO skills (name, category_id) SELECT 'Conflict Resolution', id FROM skill_categories WHERE name = 'Social Skills' AND age_group = 'middle_school';
INSERT INTO skills (name, category_id) SELECT 'Active Listening', id FROM skill_categories WHERE name = 'Social Skills' AND age_group = 'middle_school';
INSERT INTO skills (name, category_id) SELECT 'Public Speaking', id FROM skill_categories WHERE name = 'Social Skills' AND age_group = 'middle_school';
INSERT INTO skills (name, category_id) SELECT 'Leadership', id FROM skill_categories WHERE name = 'Social Skills' AND age_group = 'middle_school';
INSERT INTO skills (name, category_id) SELECT 'Empathy', id FROM skill_categories WHERE name = 'Social Skills' AND age_group = 'middle_school';
INSERT INTO skills (name, category_id) SELECT 'Cultural Awareness', id FROM skill_categories WHERE name = 'Social Skills' AND age_group = 'middle_school';

INSERT INTO skills (name, category_id) SELECT 'Organization', id FROM skill_categories WHERE name = 'Life Skills' AND age_group = 'middle_school';
INSERT INTO skills (name, category_id) SELECT 'Time Management', id FROM skill_categories WHERE name = 'Life Skills' AND age_group = 'middle_school';
INSERT INTO skills (name, category_id) SELECT 'Goal Setting', id FROM skill_categories WHERE name = 'Life Skills' AND age_group = 'middle_school';
INSERT INTO skills (name, category_id) SELECT 'Basic Cooking', id FROM skill_categories WHERE name = 'Life Skills' AND age_group = 'middle_school';
INSERT INTO skills (name, category_id) SELECT 'Money Management', id FROM skill_categories WHERE name = 'Life Skills' AND age_group = 'middle_school';
INSERT INTO skills (name, category_id) SELECT 'Self-Care', id FROM skill_categories WHERE name = 'Life Skills' AND age_group = 'middle_school';
INSERT INTO skills (name, category_id) SELECT 'First Aid', id FROM skill_categories WHERE name = 'Life Skills' AND age_group = 'middle_school';
INSERT INTO skills (name, category_id) SELECT 'Problem Solving', id FROM skill_categories WHERE name = 'Life Skills' AND age_group = 'middle_school';

-- High School Skill Categories
INSERT INTO skill_categories (name, age_group) VALUES 
('Academic Skills', 'high_school'),
('Technology Skills', 'high_school'),
('Career Skills', 'high_school'),
('Life Skills', 'high_school'),
('Social Skills', 'high_school');

-- High School Skills
INSERT INTO skills (name, category_id) SELECT 'Advanced Writing', id FROM skill_categories WHERE name = 'Academic Skills' AND age_group = 'high_school';
INSERT INTO skills (name, category_id) SELECT 'Research Methods', id FROM skill_categories WHERE name = 'Academic Skills' AND age_group = 'high_school';
INSERT INTO skills (name, category_id) SELECT 'Algebra', id FROM skill_categories WHERE name = 'Academic Skills' AND age_group = 'high_school';
INSERT INTO skills (name, category_id) SELECT 'Geometry', id FROM skill_categories WHERE name = 'Academic Skills' AND age_group = 'high_school';
INSERT INTO skills (name, category_id) SELECT 'Chemistry', id FROM skill_categories WHERE name = 'Academic Skills' AND age_group = 'high_school';
INSERT INTO skills (name, category_id) SELECT 'Physics', id FROM skill_categories WHERE name = 'Academic Skills' AND age_group = 'high_school';
INSERT INTO skills (name, category_id) SELECT 'Literary Analysis', id FROM skill_categories WHERE name = 'Academic Skills' AND age_group = 'high_school';
INSERT INTO skills (name, category_id) SELECT 'Critical Thinking', id FROM skill_categories WHERE name = 'Academic Skills' AND age_group = 'high_school';
INSERT INTO skills (name, category_id) SELECT 'Foreign Language', id FROM skill_categories WHERE name = 'Academic Skills' AND age_group = 'high_school';

INSERT INTO skills (name, category_id) SELECT 'Programming', id FROM skill_categories WHERE name = 'Technology Skills' AND age_group = 'high_school';
INSERT INTO skills (name, category_id) SELECT 'Web Design', id FROM skill_categories WHERE name = 'Technology Skills' AND age_group = 'high_school';
INSERT INTO skills (name, category_id) SELECT 'Data Analysis', id FROM skill_categories WHERE name = 'Technology Skills' AND age_group = 'high_school';
INSERT INTO skills (name, category_id) SELECT 'Digital Media', id FROM skill_categories WHERE name = 'Technology Skills' AND age_group = 'high_school';
INSERT INTO skills (name, category_id) SELECT 'Computer Applications', id FROM skill_categories WHERE name = 'Technology Skills' AND age_group = 'high_school';
INSERT INTO skills (name, category_id) SELECT 'Information Literacy', id FROM skill_categories WHERE name = 'Technology Skills' AND age_group = 'high_school';
INSERT INTO skills (name, category_id) SELECT 'Cybersecurity Basics', id FROM skill_categories WHERE name = 'Technology Skills' AND age_group = 'high_school';
INSERT INTO skills (name, category_id) SELECT '3D Modeling', id FROM skill_categories WHERE name = 'Technology Skills' AND age_group = 'high_school';

INSERT INTO skills (name, category_id) SELECT 'Resume Writing', id FROM skill_categories WHERE name = 'Career Skills' AND age_group = 'high_school';
INSERT INTO skills (name, category_id) SELECT 'Interview Skills', id FROM skill_categories WHERE name = 'Career Skills' AND age_group = 'high_school';
INSERT INTO skills (name, category_id) SELECT 'Professional Communication', id FROM skill_categories WHERE name = 'Career Skills' AND age_group = 'high_school';
INSERT INTO skills (name, category_id) SELECT 'Networking', id FROM skill_categories WHERE name = 'Career Skills' AND age_group = 'high_school';
INSERT INTO skills (name, category_id) SELECT 'Project Management', id FROM skill_categories WHERE name = 'Career Skills' AND age_group = 'high_school';
INSERT INTO skills (name, category_id) SELECT 'Leadership', id FROM skill_categories WHERE name = 'Career Skills' AND age_group = 'high_school';
INSERT INTO skills (name, category_id) SELECT 'Public Speaking', id FROM skill_categories WHERE name = 'Career Skills' AND age_group = 'high_school';
INSERT INTO skills (name, category_id) SELECT 'Entrepreneurship', id FROM skill_categories WHERE name = 'Career Skills' AND age_group = 'high_school';

INSERT INTO skills (name, category_id) SELECT 'Financial Literacy', id FROM skill_categories WHERE name = 'Life Skills' AND age_group = 'high_school';
INSERT INTO skills (name, category_id) SELECT 'Time Management', id FROM skill_categories WHERE name = 'Life Skills' AND age_group = 'high_school';
INSERT INTO skills (name, category_id) SELECT 'Goal Setting', id FROM skill_categories WHERE name = 'Life Skills' AND age_group = 'high_school';
INSERT INTO skills (name, category_id) SELECT 'Decision Making', id FROM skill_categories WHERE name = 'Life Skills' AND age_group = 'high_school';
INSERT INTO skills (name, category_id) SELECT 'Stress Management', id FROM skill_categories WHERE name = 'Life Skills' AND age_group = 'high_school';
INSERT INTO skills (name, category_id) SELECT 'Healthy Habits', id FROM skill_categories WHERE name = 'Life Skills' AND age_group = 'high_school';
INSERT INTO skills (name, category_id) SELECT 'Cooking', id FROM skill_categories WHERE name = 'Life Skills' AND age_group = 'high_school';
INSERT INTO skills (name, category_id) SELECT 'Basic Car Maintenance', id FROM skill_categories WHERE name = 'Life Skills' AND age_group = 'high_school';

INSERT INTO skills (name, category_id) SELECT 'Collaboration', id FROM skill_categories WHERE name = 'Social Skills' AND age_group = 'high_school';
INSERT INTO skills (name, category_id) SELECT 'Conflict Resolution', id FROM skill_categories WHERE name = 'Social Skills' AND age_group = 'high_school';
INSERT INTO skills (name, category_id) SELECT 'Cultural Competence', id FROM skill_categories WHERE name = 'Social Skills' AND age_group = 'high_school';
INSERT INTO skills (name, category_id) SELECT 'Emotional Intelligence', id FROM skill_categories WHERE name = 'Social Skills' AND age_group = 'high_school';
INSERT INTO skills (name, category_id) SELECT 'Mentoring', id FROM skill_categories WHERE name = 'Social Skills' AND age_group = 'high_school';
INSERT INTO skills (name, category_id) SELECT 'Community Engagement', id FROM skill_categories WHERE name = 'Social Skills' AND age_group = 'high_school';
INSERT INTO skills (name, category_id) SELECT 'Negotiation', id FROM skill_categories WHERE name = 'Social Skills' AND age_group = 'high_school';
INSERT INTO skills (name, category_id) SELECT 'Relationship Building', id FROM skill_categories WHERE name = 'Social Skills' AND age_group = 'high_school';

-- Young Adult Skill Categories
INSERT INTO skill_categories (name, age_group) VALUES 
('Technical Skills', 'young_adult'),
('Language Skills', 'young_adult'),
('Soft Skills', 'young_adult'),
('Academic Skills', 'young_adult'),
('Professional Skills', 'young_adult');

-- Young Adult Skills
INSERT INTO skills (name, category_id) SELECT 'Programming', id FROM skill_categories WHERE name = 'Technical Skills' AND age_group = 'young_adult';
INSERT INTO skills (name, category_id) SELECT 'Web Development', id FROM skill_categories WHERE name = 'Technical Skills' AND age_group = 'young_adult';
INSERT INTO skills (name, category_id) SELECT 'Data Analysis', id FROM skill_categories WHERE name = 'Technical Skills' AND age_group = 'young_adult';
INSERT INTO skills (name, category_id) SELECT 'Graphic Design', id FROM skill_categories WHERE name = 'Technical Skills' AND age_group = 'young_adult';
INSERT INTO skills (name, category_id) SELECT 'Video Editing', id FROM skill_categories WHERE name = 'Technical Skills' AND age_group = 'young_adult';
INSERT INTO skills (name, category_id) SELECT '3D Modeling', id FROM skill_categories WHERE name = 'Technical Skills' AND age_group = 'young_adult';
INSERT INTO skills (name, category_id) SELECT 'Mobile App Development', id FROM skill_categories WHERE name = 'Technical Skills' AND age_group = 'young_adult';
INSERT INTO skills (name, category_id) SELECT 'Database Management', id FROM skill_categories WHERE name = 'Technical Skills' AND age_group = 'young_adult';
INSERT INTO skills (name, category_id) SELECT 'Network Administration', id FROM skill_categories WHERE name = 'Technical Skills' AND age_group = 'young_adult';
INSERT INTO skills (name, category_id) SELECT 'Cybersecurity', id FROM skill_categories WHERE name = 'Technical Skills' AND age_group = 'young_adult';

INSERT INTO skills (name, category_id) SELECT 'English', id FROM skill_categories WHERE name = 'Language Skills' AND age_group = 'young_adult';
INSERT INTO skills (name, category_id) SELECT 'Spanish', id FROM skill_categories WHERE name = 'Language Skills' AND age_group = 'young_adult';
INSERT INTO skills (name, category_id) SELECT 'French', id FROM skill_categories WHERE name = 'Language Skills' AND age_group = 'young_adult';
INSERT INTO skills (name, category_id) SELECT 'German', id FROM skill_categories WHERE name = 'Language Skills' AND age_group = 'young_adult';
INSERT INTO skills (name, category_id) SELECT 'Chinese', id FROM skill_categories WHERE name = 'Language Skills' AND age_group = 'young_adult';
INSERT INTO skills (name, category_id) SELECT 'Japanese', id FROM skill_categories WHERE name = 'Language Skills' AND age_group = 'young_adult';
INSERT INTO skills (name, category_id) SELECT 'Russian', id FROM skill_categories WHERE name = 'Language Skills' AND age_group = 'young_adult';
INSERT INTO skills (name, category_id) SELECT 'Arabic', id FROM skill_categories WHERE name = 'Language Skills' AND age_group = 'young_adult';
INSERT INTO skills (name, category_id) SELECT 'Portuguese', id FROM skill_categories WHERE name = 'Language Skills' AND age_group = 'young_adult';
INSERT INTO skills (name, category_id) SELECT 'Italian', id FROM skill_categories WHERE name = 'Language Skills' AND age_group = 'young_adult';

INSERT INTO skills (name, category_id) SELECT 'Communication', id FROM skill_categories WHERE name = 'Soft Skills' AND age_group = 'young_adult';
INSERT INTO skills (name, category_id) SELECT 'Leadership', id FROM skill_categories WHERE name = 'Soft Skills' AND age_group = 'young_adult';
INSERT INTO skills (name, category_id) SELECT 'Teamwork', id FROM skill_categories WHERE name = 'Soft Skills' AND age_group = 'young_adult';
INSERT INTO skills (name, category_id) SELECT 'Problem Solving', id FROM skill_categories WHERE name = 'Soft Skills' AND age_group = 'young_adult';
INSERT INTO skills (name, category_id) SELECT 'Critical Thinking', id FROM skill_categories WHERE name = 'Soft Skills' AND age_group = 'young_adult';
INSERT INTO skills (name, category_id) SELECT 'Time Management', id FROM skill_categories WHERE name = 'Soft Skills' AND age_group = 'young_adult';
INSERT INTO skills (name, category_id) SELECT 'Adaptability', id FROM skill_categories WHERE name = 'Soft Skills' AND age_group = 'young_adult';
INSERT INTO skills (name, category_id) SELECT 'Creativity', id FROM skill_categories WHERE name = 'Soft Skills' AND age_group = 'young_adult';
INSERT INTO skills (name, category_id) SELECT 'Emotional Intelligence', id FROM skill_categories WHERE name = 'Soft Skills' AND age_group = 'young_adult';
INSERT INTO skills (name, category_id) SELECT 'Conflict Resolution', id FROM skill_categories WHERE name = 'Soft Skills' AND age_group = 'young_adult';

INSERT INTO skills (name, category_id) SELECT 'Research', id FROM skill_categories WHERE name = 'Academic Skills' AND age_group = 'young_adult';
INSERT INTO skills (name, category_id) SELECT 'Writing', id FROM skill_categories WHERE name = 'Academic Skills' AND age_group = 'young_adult';
INSERT INTO skills (name, category_id) SELECT 'Public Speaking', id FROM skill_categories WHERE name = 'Academic Skills' AND age_group = 'young_adult';
INSERT INTO skills (name, category_id) SELECT 'Mathematical Reasoning', id FROM skill_categories WHERE name = 'Academic Skills' AND age_group = 'young_adult';
INSERT INTO skills (name, category_id) SELECT 'Scientific Method', id FROM skill_categories WHERE name = 'Academic Skills' AND age_group = 'young_adult';
INSERT INTO skills (name, category_id) SELECT 'Literary Analysis', id FROM skill_categories WHERE name = 'Academic Skills' AND age_group = 'young_adult';
INSERT INTO skills (name, category_id) SELECT 'Historical Analysis', id FROM skill_categories WHERE name = 'Academic Skills' AND age_group = 'young_adult';
INSERT INTO skills (name, category_id) SELECT 'Statistical Analysis', id FROM skill_categories WHERE name = 'Academic Skills' AND age_group = 'young_adult';
INSERT INTO skills (name, category_id) SELECT 'Laboratory Techniques', id FROM skill_categories WHERE name = 'Academic Skills' AND age_group = 'young_adult';
INSERT INTO skills (name, category_id) SELECT 'Academic Writing', id FROM skill_categories WHERE name = 'Academic Skills' AND age_group = 'young_adult';

INSERT INTO skills (name, category_id) SELECT 'Project Management', id FROM skill_categories WHERE name = 'Professional Skills' AND age_group = 'young_adult';
INSERT INTO skills (name, category_id) SELECT 'Strategic Planning', id FROM skill_categories WHERE name = 'Professional Skills' AND age_group = 'young_adult';
INSERT INTO skills (name, category_id) SELECT 'Financial Analysis', id FROM skill_categories WHERE name = 'Professional Skills' AND age_group = 'young_adult';
INSERT INTO skills (name, category_id) SELECT 'Marketing', id FROM skill_categories WHERE name = 'Professional Skills' AND age_group = 'young_adult';
INSERT INTO skills (name, category_id) SELECT 'Sales', id FROM skill_categories WHERE name = 'Professional Skills' AND age_group = 'young_adult';
INSERT INTO skills (name, category_id) SELECT 'Customer Service', id FROM skill_categories WHERE name = 'Professional Skills' AND age_group = 'young_adult';
INSERT INTO skills (name, category_id) SELECT 'Negotiation', id FROM skill_categories WHERE name = 'Professional Skills' AND age_group = 'young_adult';
INSERT INTO skills (name, category_id) SELECT 'Presentation', id FROM skill_categories WHERE name = 'Professional Skills' AND age_group = 'young_adult';
INSERT INTO skills (name, category_id) SELECT 'Networking', id FROM skill_categories WHERE name = 'Professional Skills' AND age_group = 'young_adult';
INSERT INTO skills (name, category_id) SELECT 'Mentoring', id FROM skill_categories WHERE name = 'Professional Skills' AND age_group = 'young_adult';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_interests_category_id ON interests(category_id);
CREATE INDEX IF NOT EXISTS idx_skills_category_id ON skills(category_id);
CREATE INDEX IF NOT EXISTS idx_interest_categories_age_group ON interest_categories(age_group);
CREATE INDEX IF NOT EXISTS idx_skill_categories_age_group ON skill_categories(age_group);

-- Display summary
SELECT 
  'Interest Categories' as type,
  COUNT(*) as count,
  age_group
FROM interest_categories 
GROUP BY age_group
UNION ALL
SELECT 
  'Interests' as type,
  COUNT(*) as count,
  ic.age_group
FROM interests i
JOIN interest_categories ic ON i.category_id = ic.id
GROUP BY ic.age_group
UNION ALL
SELECT 
  'Skill Categories' as type,
  COUNT(*) as count,
  age_group
FROM skill_categories 
GROUP BY age_group
UNION ALL
SELECT 
  'Skills' as type,
  COUNT(*) as count,
  sc.age_group
FROM skills s
JOIN skill_categories sc ON s.category_id = sc.id
GROUP BY sc.age_group
ORDER BY type, age_group;
