
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
-- Migration v9: Seed institution types and categories
-- This populates the institution_categories and institution_types tables

-- Insert Institution Categories
INSERT INTO institution_categories (name, slug, description) VALUES
('Traditional Educational Institutions', 'traditional-educational', 'Formal educational institutions providing structured learning programs'),
('Specialized Training & Coaching', 'specialized-training', 'Institutions focused on specific skills and professional development'),
('Arts, Sports & Performance Education', 'arts-sports-performance', 'Creative and physical education institutions'),
('Special & Alternative Education', 'special-alternative', 'Non-traditional educational approaches and special needs institutions'),
('Government Educational Institutions', 'government-educational', 'Government-run educational and training institutions'),
('Non-Governmental Organizations', 'non-governmental', 'NGOs and non-profit educational organizations'),
('Modern Learning Environments', 'modern-learning', 'Technology-enabled and online learning platforms'),
('Other Educational Institutions', 'other-educational', 'Miscellaneous educational institutions and services')
ON CONFLICT (slug) DO NOTHING;

-- Insert Institution Types for Traditional Educational Institutions
INSERT INTO institution_types (category_id, name, slug, description)
SELECT 
  c.id,
  t.name,
  t.slug,
  t.description
FROM institution_categories c,
(VALUES 
  ('Preschool/Kindergarten', 'preschool-kindergarten', 'Early childhood education institutions'),
  ('Primary School', 'primary-school', 'Elementary education institutions'),
  ('Secondary/High School', 'secondary-high-school', 'Secondary education institutions'),
  ('University', 'university', 'Higher education institutions offering degree programs'),
  ('College', 'college', 'Post-secondary education institutions'),
  ('Community/Junior College', 'community-junior-college', 'Two-year post-secondary institutions'),
  ('Polytechnic', 'polytechnic', 'Technical and vocational higher education institutions'),
  ('Vocational/Trade School', 'vocational-trade-school', 'Specialized professional training institutions')
) AS t(name, slug, description)
WHERE c.slug = 'traditional-educational'
ON CONFLICT (category_id, slug) DO NOTHING;

-- Insert Institution Types for Specialized Training & Coaching
INSERT INTO institution_types (category_id, name, slug, description)
SELECT 
  c.id,
  t.name,
  t.slug,
  t.description
FROM institution_categories c,
(VALUES 
  ('Career Coaching Center', 'career-coaching-center', 'Professional career guidance and coaching'),
  ('Professional Skills Training', 'professional-skills-training', 'Workplace and professional skill development'),
  ('IT/Technical Training Institute', 'it-technical-training', 'Information technology and technical skills training'),
  ('Competitive Exam Coaching', 'competitive-exam-coaching', 'Test preparation for competitive examinations'),
  ('Test Preparation Center', 'test-preparation-center', 'Standardized test preparation services'),
  ('Subject Tutoring Center', 'subject-tutoring-center', 'Academic subject-specific tutoring'),
  ('Language Institute', 'language-institute', 'Foreign and native language learning institutions'),
  ('Soft Skills Development Center', 'soft-skills-development', 'Communication and interpersonal skills training')
) AS t(name, slug, description)
WHERE c.slug = 'specialized-training'
ON CONFLICT (category_id, slug) DO NOTHING;

-- Insert Institution Types for Arts, Sports & Performance Education
INSERT INTO institution_types (category_id, name, slug, description)
SELECT 
  c.id,
  t.name,
  t.slug,
  t.description
FROM institution_categories c,
(VALUES 
  ('Sports Academy/Athletic Training', 'sports-academy', 'Athletic and sports training institutions'),
  ('Music School/Conservatory', 'music-school', 'Musical education and performance training'),
  ('Dance Academy', 'dance-academy', 'Dance and choreography training institutions'),
  ('Fine Arts Institution', 'fine-arts-institution', 'Visual arts and fine arts education'),
  ('Drama/Theater School', 'drama-theater-school', 'Theatrical arts and performance training'),
  ('Film and Media Academy', 'film-media-academy', 'Film production and media arts education'),
  ('Martial Arts/Physical Training', 'martial-arts-training', 'Martial arts and physical fitness training'),
  ('Yoga and Wellness Academy', 'yoga-wellness-academy', 'Yoga, meditation, and wellness education')
) AS t(name, slug, description)
WHERE c.slug = 'arts-sports-performance'
ON CONFLICT (category_id, slug) DO NOTHING;

-- Insert Institution Types for Special & Alternative Education
INSERT INTO institution_types (category_id, name, slug, description)
SELECT 
  c.id,
  t.name,
  t.slug,
  t.description
FROM institution_categories c,
(VALUES 
  ('Special Needs Education Center', 'special-needs-education', 'Education for students with special needs'),
  ('Remedial Education Institution', 'remedial-education', 'Academic support and remedial education'),
  ('Gifted Education Program', 'gifted-education', 'Programs for academically gifted students'),
  ('Therapeutic Education Center', 'therapeutic-education', 'Educational therapy and support services'),
  ('Montessori/Waldorf School', 'montessori-waldorf-school', 'Alternative educational methodologies'),
  ('Homeschooling Support Center', 'homeschooling-support', 'Resources and support for homeschooling'),
  ('Alternative Education School', 'alternative-education-school', 'Non-traditional educational approaches')
) AS t(name, slug, description)
WHERE c.slug = 'special-alternative'
ON CONFLICT (category_id, slug) DO NOTHING;

-- Insert Institution Types for Government Educational Institutions
INSERT INTO institution_types (category_id, name, slug, description)
SELECT 
  c.id,
  t.name,
  t.slug,
  t.description
FROM institution_categories c,
(VALUES 
  ('Public School System Administration', 'public-school-system', 'Public education system administration'),
  ('Government University/College', 'government-university', 'Government-funded higher education institutions'),
  ('Military/Defense Training Academy', 'military-defense-academy', 'Military and defense training institutions'),
  ('Civil Service Training Institute', 'civil-service-training', 'Government employee training and development'),
  ('Government Research Institution', 'government-research', 'Government-funded research and development institutions'),
  ('Public Vocational Training Center', 'public-vocational-training', 'Government vocational and trade training'),
  ('Government Sports Authority', 'government-sports-authority', 'Government sports development programs')
) AS t(name, slug, description)
WHERE c.slug = 'government-educational'
ON CONFLICT (category_id, slug) DO NOTHING;

-- Insert Institution Types for Non-Governmental Organizations
INSERT INTO institution_types (category_id, name, slug, description)
SELECT 
  c.id,
  t.name,
  t.slug,
  t.description
FROM institution_categories c,
(VALUES 
  ('Educational NGO', 'educational-ngo', 'Non-profit educational organizations'),
  ('Skill Development Organization', 'skill-development-org', 'NGOs focused on skill development'),
  ('Literacy Program Provider', 'literacy-program', 'Organizations providing literacy education'),
  ('Educational Resource Provider', 'educational-resource', 'Organizations providing educational resources'),
  ('Community Learning Center', 'community-learning-center', 'Community-based learning and education centers'),
  ('International Education Organization', 'international-education', 'Global educational initiatives and programs'),
  ('Special Needs Support Organization', 'special-needs-support', 'NGOs supporting special needs education')
) AS t(name, slug, description)
WHERE c.slug = 'non-governmental'
ON CONFLICT (category_id, slug) DO NOTHING;

-- Insert Institution Types for Modern Learning Environments
INSERT INTO institution_types (category_id, name, slug, description)
SELECT 
  c.id,
  t.name,
  t.slug,
  t.description
FROM institution_categories c,
(VALUES 
  ('Online Learning Platform', 'online-learning-platform', 'Digital and online education platforms'),
  ('Blended Learning Provider', 'blended-learning-provider', 'Hybrid online and offline education'),
  ('Continuing Education Center', 'continuing-education-center', 'Adult and continuing education programs'),
  ('Educational Technology Provider', 'educational-technology', 'Technology solutions for education'),
  ('Massive Open Online Course (MOOC) Provider', 'mooc-provider', 'Large-scale online course platforms'),
  ('Virtual School', 'virtual-school', 'Fully online educational institutions'),
  ('Microlearning Platform', 'microlearning-platform', 'Bite-sized learning and training platforms')
) AS t(name, slug, description)
WHERE c.slug = 'modern-learning'
ON CONFLICT (category_id, slug) DO NOTHING;

-- Insert Institution Types for Other Educational Institutions
INSERT INTO institution_types (category_id, name, slug, description)
SELECT 
  c.id,
  t.name,
  t.slug,
  t.description
FROM institution_categories c,
(VALUES 
  ('Corporate Training Department', 'corporate-training', 'Company-based employee training departments'),
  ('Independent Research Institute', 'independent-research', 'Private research and development institutions'),
  ('Educational Think Tank', 'educational-think-tank', 'Policy and research organizations in education'),
  ('Educational Publishing Organization', 'educational-publishing', 'Educational content and material publishers'),
  ('Educational Assessment Provider', 'educational-assessment', 'Testing and assessment service providers'),
  ('Other (Not Listed)', 'other-not-listed', 'Educational institutions not covered in other categories')
) AS t(name, slug, description)
WHERE c.slug = 'other-educational'
ON CONFLICT (category_id, slug) DO NOTHING;
