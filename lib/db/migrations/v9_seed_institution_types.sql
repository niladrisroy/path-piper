
-- Migration v9: Seed institution categories and types data

-- Insert institution categories
INSERT INTO institution_categories (name, slug, description) VALUES 
('Traditional Educational Institutions', 'traditional-educational', 'Formal educational institutions following conventional academic structures'),
('Specialized Training & Coaching', 'specialized-training-coaching', 'Institutions focused on specific skill development and professional training'),
('Arts, Sports & Performance Education', 'arts-sports-performance', 'Creative and physical education institutions'),
('Special & Alternative Education', 'special-alternative-education', 'Educational institutions serving special needs and alternative learning approaches'),
('Government Educational Institutions', 'government-educational', 'Public sector educational institutions and training centers'),
('Non-Governmental Organizations', 'non-governmental-organizations', 'NGOs and non-profit organizations focused on education'),
('Modern Learning Environments', 'modern-learning-environments', 'Technology-enabled and innovative learning platforms'),
('Other Educational Institutions', 'other-educational', 'Miscellaneous educational and training organizations')
ON CONFLICT (slug) DO NOTHING;

-- Insert institution types for Traditional Educational Institutions
INSERT INTO institution_types (category_id, name, slug) 
SELECT id, 'Preschool/Kindergarten', 'preschool-kindergarten' FROM institution_categories WHERE slug = 'traditional-educational'
UNION ALL
SELECT id, 'Primary School', 'primary-school' FROM institution_categories WHERE slug = 'traditional-educational'
UNION ALL
SELECT id, 'Secondary/High School', 'secondary-high-school' FROM institution_categories WHERE slug = 'traditional-educational'
UNION ALL
SELECT id, 'University', 'university' FROM institution_categories WHERE slug = 'traditional-educational'
UNION ALL
SELECT id, 'College', 'college' FROM institution_categories WHERE slug = 'traditional-educational'
UNION ALL
SELECT id, 'Community/Junior College', 'community-junior-college' FROM institution_categories WHERE slug = 'traditional-educational'
UNION ALL
SELECT id, 'Polytechnic', 'polytechnic' FROM institution_categories WHERE slug = 'traditional-educational'
UNION ALL
SELECT id, 'Vocational/Trade School', 'vocational-trade-school' FROM institution_categories WHERE slug = 'traditional-educational'
ON CONFLICT (category_id, slug) DO NOTHING;

-- Insert institution types for Specialized Training & Coaching
INSERT INTO institution_types (category_id, name, slug)
SELECT id, 'Career Coaching Center', 'career-coaching-center' FROM institution_categories WHERE slug = 'specialized-training-coaching'
UNION ALL
SELECT id, 'Professional Skills Training', 'professional-skills-training' FROM institution_categories WHERE slug = 'specialized-training-coaching'
UNION ALL
SELECT id, 'IT/Technical Training Institute', 'it-technical-training' FROM institution_categories WHERE slug = 'specialized-training-coaching'
UNION ALL
SELECT id, 'Competitive Exam Coaching', 'competitive-exam-coaching' FROM institution_categories WHERE slug = 'specialized-training-coaching'
UNION ALL
SELECT id, 'Test Preparation Center', 'test-preparation-center' FROM institution_categories WHERE slug = 'specialized-training-coaching'
UNION ALL
SELECT id, 'Subject Tutoring Center', 'subject-tutoring-center' FROM institution_categories WHERE slug = 'specialized-training-coaching'
UNION ALL
SELECT id, 'Language Institute', 'language-institute' FROM institution_categories WHERE slug = 'specialized-training-coaching'
UNION ALL
SELECT id, 'Soft Skills Development Center', 'soft-skills-development' FROM institution_categories WHERE slug = 'specialized-training-coaching'
ON CONFLICT (category_id, slug) DO NOTHING;

-- Insert institution types for Arts, Sports & Performance Education
INSERT INTO institution_types (category_id, name, slug)
SELECT id, 'Sports Academy/Athletic Training', 'sports-academy' FROM institution_categories WHERE slug = 'arts-sports-performance'
UNION ALL
SELECT id, 'Music School/Conservatory', 'music-school' FROM institution_categories WHERE slug = 'arts-sports-performance'
UNION ALL
SELECT id, 'Dance Academy', 'dance-academy' FROM institution_categories WHERE slug = 'arts-sports-performance'
UNION ALL
SELECT id, 'Fine Arts Institution', 'fine-arts-institution' FROM institution_categories WHERE slug = 'arts-sports-performance'
UNION ALL
SELECT id, 'Drama/Theater School', 'drama-theater-school' FROM institution_categories WHERE slug = 'arts-sports-performance'
UNION ALL
SELECT id, 'Film and Media Academy', 'film-media-academy' FROM institution_categories WHERE slug = 'arts-sports-performance'
UNION ALL
SELECT id, 'Martial Arts/Physical Training', 'martial-arts-training' FROM institution_categories WHERE slug = 'arts-sports-performance'
UNION ALL
SELECT id, 'Yoga and Wellness Academy', 'yoga-wellness-academy' FROM institution_categories WHERE slug = 'arts-sports-performance'
ON CONFLICT (category_id, slug) DO NOTHING;

-- Insert institution types for Special & Alternative Education
INSERT INTO institution_types (category_id, name, slug)
SELECT id, 'Special Needs Education Center', 'special-needs-education' FROM institution_categories WHERE slug = 'special-alternative-education'
UNION ALL
SELECT id, 'Remedial Education Institution', 'remedial-education' FROM institution_categories WHERE slug = 'special-alternative-education'
UNION ALL
SELECT id, 'Gifted Education Program', 'gifted-education-program' FROM institution_categories WHERE slug = 'special-alternative-education'
UNION ALL
SELECT id, 'Therapeutic Education Center', 'therapeutic-education' FROM institution_categories WHERE slug = 'special-alternative-education'
UNION ALL
SELECT id, 'Montessori/Waldorf School', 'montessori-waldorf-school' FROM institution_categories WHERE slug = 'special-alternative-education'
UNION ALL
SELECT id, 'Homeschooling Support Center', 'homeschooling-support' FROM institution_categories WHERE slug = 'special-alternative-education'
UNION ALL
SELECT id, 'Alternative Education School', 'alternative-education-school' FROM institution_categories WHERE slug = 'special-alternative-education'
ON CONFLICT (category_id, slug) DO NOTHING;

-- Insert institution types for Government Educational Institutions
INSERT INTO institution_types (category_id, name, slug)
SELECT id, 'Public School System Administration', 'public-school-system' FROM institution_categories WHERE slug = 'government-educational'
UNION ALL
SELECT id, 'Government University/College', 'government-university' FROM institution_categories WHERE slug = 'government-educational'
UNION ALL
SELECT id, 'Military/Defense Training Academy', 'military-defense-academy' FROM institution_categories WHERE slug = 'government-educational'
UNION ALL
SELECT id, 'Civil Service Training Institute', 'civil-service-training' FROM institution_categories WHERE slug = 'government-educational'
UNION ALL
SELECT id, 'Government Research Institution', 'government-research' FROM institution_categories WHERE slug = 'government-educational'
UNION ALL
SELECT id, 'Public Vocational Training Center', 'public-vocational-training' FROM institution_categories WHERE slug = 'government-educational'
UNION ALL
SELECT id, 'Government Sports Authority', 'government-sports-authority' FROM institution_categories WHERE slug = 'government-educational'
ON CONFLICT (category_id, slug) DO NOTHING;

-- Insert institution types for Non-Governmental Organizations
INSERT INTO institution_types (category_id, name, slug)
SELECT id, 'Educational NGO', 'educational-ngo' FROM institution_categories WHERE slug = 'non-governmental-organizations'
UNION ALL
SELECT id, 'Skill Development Organization', 'skill-development-org' FROM institution_categories WHERE slug = 'non-governmental-organizations'
UNION ALL
SELECT id, 'Literacy Program Provider', 'literacy-program-provider' FROM institution_categories WHERE slug = 'non-governmental-organizations'
UNION ALL
SELECT id, 'Educational Resource Provider', 'educational-resource-provider' FROM institution_categories WHERE slug = 'non-governmental-organizations'
UNION ALL
SELECT id, 'Community Learning Center', 'community-learning-center' FROM institution_categories WHERE slug = 'non-governmental-organizations'
UNION ALL
SELECT id, 'International Education Organization', 'international-education-org' FROM institution_categories WHERE slug = 'non-governmental-organizations'
UNION ALL
SELECT id, 'Special Needs Support Organization', 'special-needs-support-org' FROM institution_categories WHERE slug = 'non-governmental-organizations'
ON CONFLICT (category_id, slug) DO NOTHING;

-- Insert institution types for Modern Learning Environments
INSERT INTO institution_types (category_id, name, slug)
SELECT id, 'Online Learning Platform', 'online-learning-platform' FROM institution_categories WHERE slug = 'modern-learning-environments'
UNION ALL
SELECT id, 'Blended Learning Provider', 'blended-learning-provider' FROM institution_categories WHERE slug = 'modern-learning-environments'
UNION ALL
SELECT id, 'Continuing Education Center', 'continuing-education-center' FROM institution_categories WHERE slug = 'modern-learning-environments'
UNION ALL
SELECT id, 'Educational Technology Provider', 'educational-technology-provider' FROM institution_categories WHERE slug = 'modern-learning-environments'
UNION ALL
SELECT id, 'Massive Open Online Course (MOOC) Provider', 'mooc-provider' FROM institution_categories WHERE slug = 'modern-learning-environments'
UNION ALL
SELECT id, 'Virtual School', 'virtual-school' FROM institution_categories WHERE slug = 'modern-learning-environments'
UNION ALL
SELECT id, 'Microlearning Platform', 'microlearning-platform' FROM institution_categories WHERE slug = 'modern-learning-environments'
ON CONFLICT (category_id, slug) DO NOTHING;

-- Insert institution types for Other Educational Institutions
INSERT INTO institution_types (category_id, name, slug)
SELECT id, 'Corporate Training Department', 'corporate-training-department' FROM institution_categories WHERE slug = 'other-educational'
UNION ALL
SELECT id, 'Independent Research Institute', 'independent-research-institute' FROM institution_categories WHERE slug = 'other-educational'
UNION ALL
SELECT id, 'Educational Think Tank', 'educational-think-tank' FROM institution_categories WHERE slug = 'other-educational'
UNION ALL
SELECT id, 'Educational Publishing Organization', 'educational-publishing-org' FROM institution_categories WHERE slug = 'other-educational'
UNION ALL
SELECT id, 'Educational Assessment Provider', 'educational-assessment-provider' FROM institution_categories WHERE slug = 'other-educational'
UNION ALL
SELECT id, 'Other (Not Listed)', 'other-not-listed' FROM institution_categories WHERE slug = 'other-educational'
ON CONFLICT (category_id, slug) DO NOTHING;
