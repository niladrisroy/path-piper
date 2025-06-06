
export const SUBJECT_SUGGESTIONS = {
  // Primary School (Classes 1-5)
  'primary-school': [
    'English',
    'Hindi',
    'Mathematics',
    'Environmental Studies (EVS)',
    'Science',
    'Social Studies',
    'Physical Education',
    'Art & Craft',
    'Music',
    'Dance',
    'Computer Science',
    'Moral Science',
    'General Knowledge'
  ],

  // Middle School (Classes 6-8)
  'middle-school': [
    'English',
    'Hindi',
    'Mathematics',
    'Science',
    'Social Science',
    'Sanskrit',
    'Computer Science',
    'Physical Education',
    'Art Education',
    'Music',
    'Work Experience',
    'Health & Physical Education',
    'Third Language (Regional)',
    'Urdu',
    'French',
    'German'
  ],

  // Secondary School (Classes 9-10)
  'secondary-school': [
    // Core subjects
    'English',
    'Hindi',
    'Mathematics',
    'Science',
    'Social Science',
    
    // Optional/Additional subjects
    'Sanskrit',
    'Computer Applications',
    'Information Technology',
    'Physical Education',
    'Art Education',
    'Music',
    'Home Science',
    'Third Language',
    'French',
    'German',
    'Urdu',
    'Regional Language'
  ],

  // Senior Secondary - Science Stream (Classes 11-12)
  'senior-secondary-science': [
    'Physics',
    'Chemistry',
    'Mathematics',
    'Biology',
    'English',
    'Physical Education',
    'Computer Science',
    'Biotechnology',
    'Engineering Drawing',
    'Electronics',
    'Psychology',
    'Hindi',
    'Sanskrit'
  ],

  // Senior Secondary - Commerce Stream (Classes 11-12)
  'senior-secondary-commerce': [
    'Accountancy',
    'Business Studies',
    'Economics',
    'Mathematics',
    'English',
    'Informatics Practices',
    'Computer Science',
    'Physical Education',
    'Entrepreneurship',
    'Hindi',
    'Legal Studies',
    'Marketing',
    'Financial Markets Management'
  ],

  // Senior Secondary - Arts/Humanities Stream (Classes 11-12)
  'senior-secondary-arts': [
    'History',
    'Political Science',
    'Geography',
    'Economics',
    'Sociology',
    'Psychology',
    'Philosophy',
    'English',
    'Hindi',
    'Sanskrit',
    'Literature',
    'Fine Arts',
    'Music',
    'Physical Education',
    'Home Science',
    'Legal Studies',
    'Mass Media Studies',
    'Fashion Studies'
  ],

  // Undergraduate - Engineering
  'undergraduate-engineering': [
    'Engineering Mathematics',
    'Physics',
    'Chemistry',
    'Computer Programming',
    'Engineering Graphics',
    'Electrical Circuits',
    'Mechanics',
    'Thermodynamics',
    'Data Structures',
    'Digital Electronics',
    'Microprocessors',
    'Software Engineering',
    'Database Management',
    'Computer Networks',
    'Operating Systems',
    'Machine Learning',
    'Artificial Intelligence'
  ],

  // Undergraduate - Medical
  'undergraduate-medical': [
    'Anatomy',
    'Physiology',
    'Biochemistry',
    'Pathology',
    'Pharmacology',
    'Microbiology',
    'Community Medicine',
    'Forensic Medicine',
    'Medicine',
    'Surgery',
    'Pediatrics',
    'Gynecology & Obstetrics',
    'Orthopedics',
    'Radiology',
    'Anesthesia',
    'Dermatology'
  ],

  // Undergraduate - Commerce/Management
  'undergraduate-commerce': [
    'Financial Accounting',
    'Cost Accounting',
    'Management Accounting',
    'Corporate Finance',
    'Marketing Management',
    'Human Resource Management',
    'Operations Management',
    'Business Law',
    'Economics',
    'Statistics',
    'Business Communication',
    'Entrepreneurship',
    'International Business',
    'E-Commerce',
    'Digital Marketing'
  ],

  // Undergraduate - Arts/Humanities
  'undergraduate-arts': [
    'English Literature',
    'Hindi Literature',
    'History',
    'Political Science',
    'Sociology',
    'Psychology',
    'Philosophy',
    'Economics',
    'Geography',
    'Journalism',
    'Mass Communication',
    'Fine Arts',
    'Performing Arts',
    'Language Studies',
    'Cultural Studies',
    'Social Work'
  ],

  // Online Learning Platforms
  'online-platform': [
    'Mathematics',
    'Science',
    'English',
    'Coding',
    'Programming',
    'Data Science',
    'Machine Learning',
    'Web Development',
    'App Development',
    'Digital Marketing',
    'Graphic Design',
    'Video Editing',
    'Photography',
    'Music Production',
    'Language Learning',
    'Test Preparation',
    'JEE Preparation',
    'NEET Preparation',
    'CAT Preparation'
  ],

  // Coaching/Tuition Centers
  'coaching-center': [
    'JEE Main & Advanced',
    'NEET',
    'CAT',
    'GATE',
    'SSC',
    'Banking Exams',
    'Railway Exams',
    'UPSC Civil Services',
    'State PSC',
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'English',
    'Reasoning',
    'General Knowledge',
    'Current Affairs'
  ],

  // Skill Development/Vocational
  'skill-development': [
    'Computer Hardware',
    'Software Development',
    'Web Design',
    'Digital Marketing',
    'Data Entry',
    'Accounting Software',
    'Graphic Design',
    'Video Editing',
    'Photography',
    'Electrical Work',
    'Plumbing',
    'Carpentry',
    'Tailoring',
    'Beauty & Wellness',
    'Hotel Management',
    'Tourism',
    'Event Management',
    'Retail Management'
  ],

  // Default fallback
  'default': [
    'Mathematics',
    'Science',
    'English',
    'Hindi',
    'Social Studies',
    'Computer Science',
    'Physical Education',
    'Art',
    'Music'
  ]
}

// Function to get subject suggestions based on institution type
export function getSubjectSuggestions(institutionTypeSlug: string): string[] {
  return SUBJECT_SUGGESTIONS[institutionTypeSlug as keyof typeof SUBJECT_SUGGESTIONS] || SUBJECT_SUGGESTIONS.default
}
