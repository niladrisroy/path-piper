
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

const OPENAI_API_KEY = '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'

export async function POST(request: NextRequest) {
  try {
    console.log('🤖 Self-analysis API request received')
    
    // Get auth token from cookies
    const cookieStore = await cookies()
    const token = cookieStore.get('sb-access-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error || !user) {
      console.error('Auth error:', error)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { query, studentData } = await request.json()

    if (!query || !studentData) {
      return NextResponse.json({ error: 'Missing query or student data' }, { status: 400 })
    }

    console.log('🔍 Processing analysis for user:', user.id)
    console.log('📝 Query:', query)

    // Prepare student data summary for AI
    const profileSummary = createProfileSummary(studentData)
    
    // Create the AI prompt
    const systemPrompt = `You are an expert educational counselor and career advisor specialized in student development. You provide thoughtful, encouraging, and actionable insights based on comprehensive student profile analysis.

Your role is to:
1. Analyze the student's complete academic and personal profile
2. Provide honest but constructive feedback
3. Identify strengths, growth areas, and opportunities
4. Suggest specific, actionable steps for improvement
5. Offer career guidance aligned with their interests and skills
6. Give realistic timelines and expectations
7. Maintain a supportive and motivational tone

Guidelines:
- Be specific and data-driven in your analysis
- Provide actionable recommendations with clear next steps
- Consider both short-term and long-term goals
- Acknowledge achievements while identifying improvement areas
- Suggest resources, courses, or activities when relevant
- Be encouraging but realistic about challenges
- Consider the student's age group and education level in your advice`

    const userPrompt = `Here is the complete profile data for analysis:

${profileSummary}

Student's Question: "${query}"

Please provide a comprehensive analysis addressing their question. Include:
1. Key insights about their current profile
2. Strengths and areas for improvement
3. Specific recommendations and next steps
4. Career alignment suggestions if relevant
5. Timeline for achieving goals

Be detailed, supportive, and actionable in your response.`

    // Call OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    })

    if (!openaiResponse.ok) {
      console.error('OpenAI API error:', await openaiResponse.text())
      throw new Error('Failed to get AI analysis')
    }

    const aiResult = await openaiResponse.json()
    const analysis = aiResult.choices[0]?.message?.content

    if (!analysis) {
      throw new Error('No analysis received from AI')
    }

    console.log('✅ Analysis completed successfully')

    return NextResponse.json({ 
      analysis,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Self-analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze profile' },
      { status: 500 }
    )
  }
}

function createProfileSummary(studentData: any): string {
  const { profile, interests, skills, educationHistory, achievements, goals } = studentData

  let summary = `STUDENT PROFILE ANALYSIS DATA:\n\n`

  // Basic Information
  summary += `## PERSONAL INFORMATION:\n`
  summary += `Name: ${profile?.firstName || 'Not provided'} ${profile?.lastName || ''}\n`
  summary += `Bio: ${profile?.bio || 'No bio provided'}\n`
  summary += `Location: ${profile?.location || 'Not specified'}\n`
  summary += `Age Group: ${profile?.ageGroup || 'Not specified'}\n`
  summary += `Education Level: ${profile?.educationLevel || 'Not specified'}\n\n`

  // Interests
  summary += `## INTERESTS (${interests?.length || 0} total):\n`
  if (interests && interests.length > 0) {
    interests.forEach((interest: any, index: number) => {
      const interestName = interest.name || interest.interest?.name || 'Unknown'
      const category = interest.category || interest.interest?.category?.name || 'General'
      summary += `${index + 1}. ${interestName} (Category: ${category})\n`
    })
  } else {
    summary += `No interests specified - This is a significant gap that needs attention.\n`
  }
  summary += `\n`

  // Skills
  summary += `## SKILLS (${skills?.length || 0} total):\n`
  if (skills && skills.length > 0) {
    skills.forEach((skill: any, index: number) => {
      const skillName = skill.name || skill.skill?.name || 'Unknown'
      const proficiency = skill.proficiencyLevel || skill.proficiency_level || 'Not rated'
      const category = skill.category || skill.skill?.category?.name || 'General'
      summary += `${index + 1}. ${skillName} - Proficiency: ${proficiency}% (Category: ${category})\n`
    })
  } else {
    summary += `No skills listed - This is a critical gap that needs immediate attention.\n`
  }
  summary += `\n`

  // Education History
  summary += `## EDUCATION HISTORY (${educationHistory?.length || 0} entries):\n`
  if (educationHistory && educationHistory.length > 0) {
    educationHistory.forEach((edu: any, index: number) => {
      summary += `${index + 1}. Institution: ${edu.institutionName || 'Not specified'}\n`
      summary += `   - Degree/Program: ${edu.degreeProgram || 'Not specified'}\n`
      summary += `   - Field of Study: ${edu.fieldOfStudy || 'Not specified'}\n`
      summary += `   - Grade Level: ${edu.gradeLevel || edu.grade_level || 'Not specified'}\n`
      summary += `   - Current: ${edu.isCurrent || edu.is_current ? 'Yes' : 'No'}\n`
      summary += `   - Duration: ${edu.startDate || 'Not specified'} to ${edu.endDate || (edu.isCurrent ? 'Present' : 'Not specified')}\n`
      if (edu.subjects && edu.subjects.length > 0) {
        summary += `   - Subjects: ${edu.subjects.join(', ')}\n`
      }
      if (edu.gpa) {
        summary += `   - GPA: ${edu.gpa}\n`
      }
      summary += `\n`
    })
  } else {
    summary += `No education history provided - This is essential information that's missing.\n\n`
  }

  // Goals
  summary += `## CAREER GOALS (${goals?.length || 0} total):\n`
  if (goals && goals.length > 0) {
    goals.forEach((goal: any, index: number) => {
      summary += `${index + 1}. ${goal.title || goal.goal || 'Untitled Goal'}\n`
      if (goal.description) {
        summary += `   Description: ${goal.description}\n`
      }
      if (goal.targetDate || goal.target_date) {
        summary += `   Target Date: ${goal.targetDate || goal.target_date}\n`
      }
      if (goal.category) {
        summary += `   Category: ${goal.category}\n`
      }
      summary += `\n`
    })
  } else {
    summary += `No goals specified - This indicates lack of direction and planning.\n\n`
  }

  // Achievements
  summary += `## ACHIEVEMENTS (${achievements?.length || 0} total):\n`
  if (achievements && achievements.length > 0) {
    achievements.forEach((achievement: any, index: number) => {
      summary += `${index + 1}. ${achievement.name || achievement.title || 'Untitled Achievement'}\n`
      if (achievement.description) {
        summary += `   Description: ${achievement.description}\n`
      }
      if (achievement.date_of_achievement || achievement.dateOfAchievement) {
        summary += `   Date: ${achievement.date_of_achievement || achievement.dateOfAchievement}\n`
      }
      summary += `\n`
    })
  } else {
    summary += `No achievements recorded - This suggests either lack of documentation or limited accomplishments.\n\n`
  }

  // Profile Completeness Analysis
  summary += `## PROFILE COMPLETENESS ANALYSIS:\n`
  const completeness = calculateProfileCompleteness(studentData)
  summary += `Overall Profile Completeness: ${completeness.percentage}%\n`
  summary += `Missing Critical Sections: ${completeness.missingSections.join(', ')}\n`
  summary += `Strengths: ${completeness.strengths.join(', ')}\n`
  summary += `Priority Improvements: ${completeness.improvements.join(', ')}\n\n`

  return summary
}

function calculateProfileCompleteness(studentData: any) {
  const { profile, interests, skills, educationHistory, achievements, goals } = studentData
  
  let score = 0
  let maxScore = 6
  const missingSections = []
  const strengths = []
  const improvements = []

  // Check each section
  if (profile?.firstName && profile?.lastName && profile?.bio) {
    score += 1
    strengths.push('Complete basic information')
  } else {
    missingSections.push('Basic Information')
    improvements.push('Complete your profile with name and bio')
  }

  if (interests && interests.length > 0) {
    score += 1
    strengths.push(`${interests.length} interests listed`)
  } else {
    missingSections.push('Interests')
    improvements.push('Add your interests and passions')
  }

  if (skills && skills.length > 0) {
    score += 1
    strengths.push(`${skills.length} skills documented`)
  } else {
    missingSections.push('Skills')
    improvements.push('Document your skills and abilities')
  }

  if (educationHistory && educationHistory.length > 0) {
    score += 1
    strengths.push('Education history provided')
  } else {
    missingSections.push('Education History')
    improvements.push('Add your educational background')
  }

  if (goals && goals.length > 0) {
    score += 1
    strengths.push(`${goals.length} goals set`)
  } else {
    missingSections.push('Goals')
    improvements.push('Define your career goals and aspirations')
  }

  if (achievements && achievements.length > 0) {
    score += 1
    strengths.push(`${achievements.length} achievements recorded`)
  } else {
    missingSections.push('Achievements')
    improvements.push('Document your accomplishments and achievements')
  }

  const percentage = Math.round((score / maxScore) * 100)

  return {
    percentage,
    missingSections,
    strengths: strengths.length > 0 ? strengths : ['Profile created'],
    improvements: improvements.length > 0 ? improvements : ['Continue building your profile']
  }
}
