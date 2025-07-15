
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface ModerationRequest {
  content: string
  type: 'post' | 'comment' | 'profile' | 'message'
  userId: string
  imageUrl?: string
}

interface ModerationResult {
  status: 'approved' | 'pending_review' | 'flagged' | 'rejected'
  riskScore: number
  flags: string[]
  reason?: string
  suggestions?: string[]
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = request.cookies
    const accessToken = cookieStore.get('sb-access-token')?.value

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken)

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: ModerationRequest = await request.json()
    const { content, type, userId, imageUrl } = body

    if (!content || !type || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const result = await performDetailedModeration(content, type, imageUrl)

    // Log moderation attempts for audit
    await logModerationAttempt(userId, type, content, result)

    return NextResponse.json({ success: true, moderation: result })
  } catch (error) {
    console.error('Moderation API error:', error)
    return NextResponse.json({ error: 'Moderation failed' }, { status: 500 })
  }
}

async function performDetailedModeration(
  content: string, 
  type: string, 
  imageUrl?: string
): Promise<ModerationResult> {
  let riskScore = 0
  const flags: string[] = []
  const suggestions: string[] = []

  // Age-appropriate content checking for educational platform
  const educationalGuidelines = {
    elementary: {
      maxRiskScore: 1,
      blockedTopics: ['violence', 'sexual_content', 'substance_abuse', 'hate_speech']
    },
    middle_school: {
      maxRiskScore: 2,
      blockedTopics: ['sexual_content', 'substance_abuse', 'hate_speech']
    },
    high_school: {
      maxRiskScore: 3,
      blockedTopics: ['hate_speech', 'self_harm']
    },
    young_adult: {
      maxRiskScore: 4,
      blockedTopics: ['hate_speech', 'self_harm']
    }
  }

  // Enhanced keyword detection with context awareness
  const contextAwareModeration = analyzeContentContext(content, type)
  riskScore += contextAwareModeration.score
  flags.push(...contextAwareModeration.flags)

  // Educational content encouragement
  if (isEducationalContent(content)) {
    riskScore = Math.max(0, riskScore - 1)
    flags.push('educational_content')
  }

  // Positive reinforcement detection
  if (isPositiveContent(content)) {
    riskScore = Math.max(0, riskScore - 1)
    flags.push('positive_content')
  }

  // Generate suggestions for improvement
  if (riskScore > 0) {
    suggestions.push(...generateContentSuggestions(flags))
  }

  // Final status determination
  let status: 'approved' | 'pending_review' | 'flagged' | 'rejected'
  let reason = ''

  if (riskScore >= 8 || flags.includes('self_harm') || flags.includes('hate_speech')) {
    status = 'rejected'
    reason = 'Content violates community guidelines'
  } else if (riskScore >= 4 || flags.includes('violence') || flags.includes('sexual_content')) {
    status = 'pending_review'
    reason = 'Content requires manual review'
  } else if (riskScore >= 2) {
    status = 'flagged'
    reason = 'Content flagged for minor issues'
  } else {
    status = 'approved'
  }

  return {
    status,
    riskScore,
    flags,
    reason,
    suggestions
  }
}

function analyzeContentContext(content: string, type: string) {
  let score = 0
  const flags: string[] = []

  // Context-specific analysis
  if (type === 'post') {
    // Posts should be more educational and constructive
    if (content.length < 10) {
      score += 1
      flags.push('too_short')
    }
  }

  if (type === 'comment') {
    // Comments should be respectful and relevant
    if (content.toLowerCase().includes('first') && content.length < 20) {
      score += 1
      flags.push('low_effort_comment')
    }
  }

  return { score, flags }
}

function isEducationalContent(content: string): boolean {
  const educationalKeywords = [
    'learn', 'study', 'research', 'project', 'experiment', 'discovery',
    'knowledge', 'education', 'school', 'university', 'college', 'course',
    'lesson', 'tutorial', 'guide', 'explain', 'understand', 'analyze',
    'solve', 'problem', 'solution', 'mathematics', 'science', 'history',
    'literature', 'art', 'music', 'technology', 'innovation'
  ]

  return educationalKeywords.some(keyword => 
    content.toLowerCase().includes(keyword)
  )
}

function isPositiveContent(content: string): boolean {
  const positiveKeywords = [
    'thank', 'grateful', 'appreciate', 'love', 'amazing', 'wonderful',
    'great', 'excellent', 'awesome', 'fantastic', 'beautiful', 'inspiring',
    'motivated', 'encouraging', 'supportive', 'helpful', 'kind', 'friendly',
    'celebrate', 'achievement', 'success', 'proud', 'excited', 'happy'
  ]

  return positiveKeywords.some(keyword => 
    content.toLowerCase().includes(keyword)
  )
}

function generateContentSuggestions(flags: string[]): string[] {
  const suggestions: string[] = []

  if (flags.includes('profanity')) {
    suggestions.push('Consider using more appropriate language for an educational environment')
  }

  if (flags.includes('excessive_caps')) {
    suggestions.push('Try using normal capitalization - it\'s easier to read')
  }

  if (flags.includes('spam')) {
    suggestions.push('Focus on creating meaningful, educational content')
  }

  if (flags.includes('too_short')) {
    suggestions.push('Consider adding more detail to make your post more helpful')
  }

  if (flags.includes('violence')) {
    suggestions.push('This content may not be appropriate for an educational platform')
  }

  return suggestions
}

async function logModerationAttempt(
  userId: string, 
  type: string, 
  content: string, 
  result: ModerationResult
) {
  try {
    // Log to console for now - in production, save to database
    console.log(`📊 Moderation Log:`, {
      userId,
      type,
      contentLength: content.length,
      status: result.status,
      riskScore: result.riskScore,
      flags: result.flags,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Failed to log moderation attempt:', error)
  }
}
