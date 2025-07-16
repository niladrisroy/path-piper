
import { prisma } from '@/lib/prisma'

interface ModerationConfig {
  enableCache: boolean
  enableMLModeration: boolean
  cacheExpiryMinutes: number
  fastTrackThreshold: number
}

interface ModerationResult {
  status: 'approved' | 'pending_review' | 'flagged' | 'rejected'
  riskScore: number
  flags: string[]
  confidence: number
  processingTime: number
  reason?: string
  suggestions?: string[]
  requiresHumanReview: boolean
}

class OptimizedModerationService {
  private cache = new Map<string, { result: ModerationResult; timestamp: number }>()
  private config: ModerationConfig = {
    enableCache: true,
    enableMLModeration: false, // Enable when ML service is ready
    cacheExpiryMinutes: 60,
    fastTrackThreshold: 5
  }

  // Fast pattern-based moderation for low-risk content
  private async fastTrackModeration(content: string): Promise<ModerationResult | null> {
    const startTime = Date.now()
    
    // Quick profanity check
    const basicProfanity = /\b(fuck|shit|damn|bitch)\b/gi
    const profanityMatches = content.match(basicProfanity)
    
    // Safe content indicators
    const safePatterns = [
      /\b(learn|study|school|homework|project|assignment)\b/gi,
      /\b(happy|excited|proud|grateful|thankful)\b/gi
    ]
    
    const isSafeContent = safePatterns.some(pattern => pattern.test(content))
    const hasBasicProfanity = profanityMatches && profanityMatches.length > 0
    
    // Fast-track approval for clearly safe content
    if (isSafeContent && !hasBasicProfanity && content.length < 500) {
      return {
        status: 'approved',
        riskScore: 0,
        flags: [],
        confidence: 0.95,
        processingTime: Date.now() - startTime,
        requiresHumanReview: false
      }
    }
    
    return null // Needs full moderation
  }

  // Comprehensive moderation with optimizations
  private async comprehensiveModeration(content: string): Promise<ModerationResult> {
    const startTime = Date.now()
    let riskScore = 0
    const flags: string[] = []
    let confidence = 0.8

    // Optimized pattern matching with pre-compiled regex
    const patterns = {
      violence: /\b(kill|murder|death|bomb|gun|weapon|hurt|harm|fight)\b/gi,
      selfHarm: /\b(suicide|kill myself|hurt myself|cut myself|end it all)\b/gi,
      personalInfo: /\b(\d{3}-\d{2}-\d{4}|\d{10}|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/g,
      bullying: /\b(you (are|look) (stupid|ugly|fat|dumb|weird|loser))\b/gi,
      inappropriate: /\b(sex|porn|nude|drugs|alcohol|marijuana)\b/gi
    }

    // Process patterns in parallel for better performance
    const patternResults = await Promise.all(
      Object.entries(patterns).map(async ([category, pattern]) => {
        const matches = content.match(pattern)
        return { category, matches: matches?.length || 0 }
      })
    )

    // Calculate risk score based on pattern matches
    patternResults.forEach(({ category, matches }) => {
      if (matches > 0) {
        switch (category) {
          case 'violence':
            riskScore += matches * 15
            flags.push('violence')
            break
          case 'selfHarm':
            riskScore += matches * 20
            flags.push('self_harm')
            break
          case 'personalInfo':
            riskScore += matches * 25
            flags.push('personal_information')
            break
          case 'bullying':
            riskScore += matches * 12
            flags.push('bullying')
            break
          case 'inappropriate':
            riskScore += matches * 8
            flags.push('inappropriate_content')
            break
        }
      }
    })

    // Determine status based on risk score
    let status: ModerationResult['status']
    let requiresHumanReview = false

    if (riskScore >= 25 || flags.includes('self_harm')) {
      status = 'rejected'
      requiresHumanReview = true
      confidence = 0.95
    } else if (riskScore >= 15 || flags.includes('violence') || flags.includes('personal_information')) {
      status = 'pending_review'
      requiresHumanReview = true
      confidence = 0.85
    } else if (riskScore >= 5) {
      status = 'flagged'
      confidence = 0.75
    } else {
      status = 'approved'
      confidence = 0.9
    }

    return {
      status,
      riskScore,
      flags,
      confidence,
      processingTime: Date.now() - startTime,
      requiresHumanReview
    }
  }

  // Cache management
  private getCachedResult(content: string): ModerationResult | null {
    if (!this.config.enableCache) return null
    
    const contentHash = this.hashContent(content)
    const cached = this.cache.get(contentHash)
    
    if (cached) {
      const isExpired = Date.now() - cached.timestamp > this.config.cacheExpiryMinutes * 60 * 1000
      if (!isExpired) {
        return { ...cached.result, processingTime: 1 } // Cache hit
      } else {
        this.cache.delete(contentHash)
      }
    }
    
    return null
  }

  private setCachedResult(content: string, result: ModerationResult): void {
    if (!this.config.enableCache) return
    
    const contentHash = this.hashContent(content)
    this.cache.set(contentHash, {
      result,
      timestamp: Date.now()
    })
  }

  private hashContent(content: string): string {
    // Simple hash function for caching
    let hash = 0
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return hash.toString()
  }

  // Main moderation method
  async moderateContent(content: string, userId: string, type: string): Promise<ModerationResult> {
    // Check cache first
    const cachedResult = this.getCachedResult(content)
    if (cachedResult) {
      return cachedResult
    }

    // Try fast-track moderation first
    const fastResult = await this.fastTrackModeration(content)
    if (fastResult) {
      this.setCachedResult(content, fastResult)
      await this.logModerationResult(userId, type, content, fastResult)
      return fastResult
    }

    // Fall back to comprehensive moderation
    const result = await this.comprehensiveModeration(content)
    this.setCachedResult(content, result)
    await this.logModerationResult(userId, type, content, result)
    
    return result
  }

  private async logModerationResult(userId: string, type: string, content: string, result: ModerationResult): Promise<void> {
    try {
      await prisma.moderationLog.create({
        data: {
          userId,
          contentType: type,
          content: content.substring(0, 1000),
          status: result.status,
          riskScore: result.riskScore,
          flags: result.flags,
          reason: result.reason || `Risk score: ${result.riskScore}`,
          requiresHumanReview: result.requiresHumanReview
        }
      })
    } catch (error) {
      console.error('Failed to log moderation result:', error)
    }
  }
}

export const moderationService = new OptimizedModerationService()
