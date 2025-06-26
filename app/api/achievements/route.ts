import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(request: NextRequest) {
  try {
    console.log('🎯 GET achievements - Starting request');

    // Check if parent is viewing as student
    const parentViewMode = request.cookies.get('parent-view-mode')?.value === 'true'
    const parentViewStudentId = request.cookies.get('parent-view-student-id')?.value
    let userId = null

    if (parentViewMode && parentViewStudentId) {
      // Parent is viewing a student's achievements
      userId = parentViewStudentId
      console.log('👨‍👩‍👧‍👦 Parent view mode - Student ID:', userId);
    } else {
      // Normal authentication flow
      const accessToken = request.cookies.get('sb-access-token')?.value
      console.log('🔑 Access token present:', !!accessToken);

      if (!accessToken) {
        return NextResponse.json(
          { error: 'No access token found' }, 
          { status: 401 }
        )
      }

      const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)

      if (authError || !user) {
        console.log('❌ Authentication failed:', authError);
        return NextResponse.json(
          { error: 'Invalid authentication' }, 
          { status: 401 }
        )
      }

      userId = user.id
      console.log('✅ User authenticated:', userId);
    }

    const achievements = await prisma.userAchievement.findMany({
      where: { userId: userId },
      orderBy: { dateOfAchievement: 'desc' }
    })

    return NextResponse.json({ achievements })
  } catch (error) {
    console.error('Error fetching achievements:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description, dateOfAchievement, achievementTypeId, achievementImageIcon } = await request.json()

    // Check if parent is viewing as student
    const parentViewMode = request.cookies.get('parent-view-mode')?.value === 'true'
    const parentViewStudentId = request.cookies.get('parent-view-student-id')?.value
    let userId = null

    if (parentViewMode && parentViewStudentId) {
      // Parent is creating an achievement for a student
      userId = parentViewStudentId

      // Verify parent has permission
      const parentAuthId = request.cookies.get('parent-auth-id')?.value
      if (!parentAuthId) {
        return NextResponse.json(
          { error: 'Parent authentication required' }, 
          { status: 401 }
        )
      }

      // Verify parent profile and student relationship
      const parentProfile = await prisma.parentProfile.findFirst({
        where: { authId: parentAuthId }
      })

      if (!parentProfile) {
        return NextResponse.json(
          { error: 'Parent profile not found' }, 
          { status: 404 }
        )
      }

      // Verify student belongs to this parent
      const studentProfile = await prisma.profile.findFirst({
        where: {
          id: parentViewStudentId,
          parentId: parentProfile.id,
          role: 'student'
        }
      })

      if (!studentProfile) {
        return NextResponse.json(
          { error: 'Student not found or not authorized' }, 
          { status: 404 }
        )
      }
    } else {
      // Normal authentication flow
      const accessToken = request.cookies.get('sb-access-token')?.value

      if (!accessToken) {
        return NextResponse.json(
          { error: 'No access token found' }, 
          { status: 401 }
        )
      }

      const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)

      if (authError || !user) {
        return NextResponse.json(
          { error: 'Invalid authentication' }, 
          { status: 401 }
        )
      }

      userId = user.id
    }

    if (!name || !description || !dateOfAchievement || !achievementTypeId) {
      return NextResponse.json(
        { error: 'Name, description, date, and achievement type are required' },
        { status: 400 }
      )
    }

    // Create new achievement
    const achievement = await prisma.userAchievement.create({
      data: {
        userId: userId,
        name,
        description,
        dateOfAchievement: new Date(dateOfAchievement),
        achievementTypeId: parseInt(achievementTypeId),
        achievementImageIcon: achievementImageIcon || null
      }
    })

    return NextResponse.json({ achievement })
  } catch (error) {
    console.error('Error creating achievement:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    let token = authHeader?.replace('Bearer ', '')

    if (!token) {
      // Try to get token from cookies as fallback
      const authCookie = request.cookies.get('sb-access-token')?.value ||
                        request.cookies.get('sb-refresh-token')?.value

      if (authCookie) {
        token = authCookie
      }
    }

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify the user
    const { data: authData, error: authError } = await supabase.auth.getUser(token)

    if (authError || !authData.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = authData.user.id
    const { searchParams } = new URL(request.url)
    const achievementId = searchParams.get('id')

    if (!achievementId) {
      return NextResponse.json({ error: 'Achievement ID is required' }, { status: 400 })
    }

    const body = await request.json()
    const { name, description, dateOfAchievement, achievementTypeId, achievementImageIcon } = body

    if (!name || !description || !dateOfAchievement || !achievementTypeId) {
      return NextResponse.json(
        { error: 'Name, description, date, and achievement type are required' },
        { status: 400 }
      )
    }

    // Verify the achievement belongs to the user before updating
    const existingAchievement = await prisma.userAchievement.findFirst({
      where: { 
        id: parseInt(achievementId),
        userId: userId 
      }
    })

    if (!existingAchievement) {
      return NextResponse.json({ error: 'Achievement not found' }, { status: 404 })
    }

    // Update the achievement
    const updatedAchievement = await prisma.userAchievement.update({
      where: { id: parseInt(achievementId) },
      data: {
        name,
        description,
        dateOfAchievement: new Date(dateOfAchievement),
        achievementTypeId: parseInt(achievementTypeId),
        achievementImageIcon: achievementImageIcon || null
      }
    })

    return NextResponse.json({ achievement: updatedAchievement })
  } catch (error) {
    console.error('Error updating achievement:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    let token = authHeader?.replace('Bearer ', '')

    if (!token) {
      // Try to get token from cookies as fallback
      const authCookie = request.cookies.get('sb-access-token')?.value ||
                        request.cookies.get('sb-refresh-token')?.value

      if (authCookie) {
        token = authCookie
      }
    }

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify the user
    const { data: authData, error: authError } = await supabase.auth.getUser(token)

    if (authError || !authData.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = authData.user.id
    const { searchParams } = new URL(request.url)
    const achievementId = searchParams.get('id')

    if (!achievementId) {
      return NextResponse.json({ error: 'Achievement ID is required' }, { status: 400 })
    }

    // Verify the achievement belongs to the user before deleting
    const achievement = await prisma.userAchievement.findFirst({
      where: { 
        id: parseInt(achievementId),
        userId: userId 
      }
    })

    if (!achievement) {
      return NextResponse.json({ error: 'Achievement not found' }, { status: 404 })
    }

    // Delete the achievement
    await prisma.userAchievement.delete({
      where: { id: parseInt(achievementId) }
    })

    return NextResponse.json({ message: 'Achievement deleted successfully' })
  } catch (error) {
    console.error('Error deleting achievement:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}