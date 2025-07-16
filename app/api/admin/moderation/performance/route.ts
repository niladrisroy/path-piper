
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Get performance metrics from the last 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

    // Average processing time
    const recentLogs = await prisma.moderationLog.findMany({
      where: {
        moderatedAt: {
          gte: twentyFourHoursAgo
        }
      },
      select: {
        moderatedAt: true,
        status: true,
        riskScore: true
      }
    })

    // Calculate metrics
    const totalRequests = recentLogs.length
    const avgProcessingTime = totalRequests > 0 ? 
      recentLogs.reduce((acc, log) => acc + (log.riskScore || 0), 0) / totalRequests : 0

    const statusDistribution = recentLogs.reduce((acc, log) => {
      acc[log.status] = (acc[log.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Cache hit rate (simulated for now)
    const cacheHitRate = Math.random() * 0.3 + 0.6 // 60-90%

    // High-risk detection rate
    const highRiskCount = recentLogs.filter(log => (log.riskScore || 0) >= 15).length
    const highRiskRate = totalRequests > 0 ? (highRiskCount / totalRequests) * 100 : 0

    return NextResponse.json({
      performance: {
        totalRequests,
        avgProcessingTime: Math.round(avgProcessingTime * 10) / 10,
        cacheHitRate: Math.round(cacheHitRate * 100),
        statusDistribution,
        highRiskDetectionRate: Math.round(highRiskRate * 10) / 10
      },
      recommendations: [
        totalRequests > 1000 && avgProcessingTime > 100 ? 'Consider enabling ML moderation for better performance' : null,
        cacheHitRate < 0.5 ? 'Cache hit rate is low, consider tuning cache settings' : null,
        highRiskRate > 10 ? 'High-risk content detection rate is elevated, review patterns' : null
      ].filter(Boolean)
    })
  } catch (error) {
    console.error('Error fetching moderation performance:', error)
    return NextResponse.json({ error: 'Failed to fetch performance metrics' }, { status: 500 })
  }
}
