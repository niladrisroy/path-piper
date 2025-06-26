import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { prisma } from '@/lib/prisma'
import { supabase } from '@/lib/supabase'
import { cookies } from 'next/headers'

// Auth helper function
async function getAuthenticatedUser(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('No valid authorization header');
  }

  const token = authHeader.split(' ')[1];
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    throw new Error('Invalid authentication token');
  }

  return { userId: user.id, user };
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Fetching education history')

    // Check if parent is viewing as student
    const parentViewMode = request.cookies.get('parent-view-mode')?.value === 'true'
    const parentViewStudentId = request.cookies.get('parent-view-student-id')?.value
    let userId = null

    if (parentViewMode && parentViewStudentId) {
      // Parent is viewing a student's education
      userId = parentViewStudentId
    } else {
      // Normal authentication flow
      const accessToken = request.cookies.get('sb-access-token')?.value

      if (!accessToken) {
        console.log('❌ No access token found')
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)

      if (authError || !user) {
        console.log('❌ Authentication failed')
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      userId = user.id
    }

    // Fetch education history for the authenticated user using Prisma
    const educationHistory = await prisma.studentEducationHistory.findMany({
      where: { studentId: userId },
      orderBy: {
        startDate: 'desc'
      },
      include: {
        institutionType: {
          include: {
            category: true
          }
        }
      }
    })

    // Transform database fields to match the frontend interface
    const transformedEducation = educationHistory.map(entry => ({
      id: entry.id,
      institutionName: entry.institutionName,
      institutionCategory: entry.institutionType?.category?.slug || '',
      institutionType: entry.institutionTypeId ? entry.institutionTypeId.toString() : '',
      institutionTypeName: entry.institutionType?.name || '', // Add the type name
      degree: entry.degreeProgram || '',
      fieldOfStudy: entry.fieldOfStudy || '',
      subjects: Array.isArray(entry.subjects) ? entry.subjects : [],
      startDate: entry.startDate ? entry.startDate.toISOString().split('T')[0] : '',
      endDate: entry.endDate ? entry.endDate.toISOString().split('T')[0] : '',
      isCurrent: entry.isCurrent || false,
      grade: entry.gradeLevel || '',
      description: entry.description || ''
    }))

    return NextResponse.json({ education: transformedEducation })
  } catch (error) {
    console.error('Error in GET /api/education:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Check if parent is viewing as student
    const parentViewMode = request.cookies.get('parent-view-mode')?.value === 'true'
    const parentViewStudentId = request.cookies.get('parent-view-student-id')?.value
    let userId = null

    if (parentViewMode && parentViewStudentId) {
      // Parent is updating a student's education
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

    // Validate required fields
    if (!data.institutionName || !data.institutionTypeId) {
      return NextResponse.json(
        { error: 'Institution name and type are required' },
        { status: 400 }
      );
    }

    const educationRecord = await prisma.studentEducationHistory.create({
      data: {
        studentId: userId,
        institutionName: data.institutionName,
        institutionTypeId: parseInt(data.institutionTypeId),
        degreeProgram: data.degree || null,
        fieldOfStudy: data.fieldOfStudy || null,
        subjects: Array.isArray(data.subjects) ? data.subjects : [],
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        isCurrent: Boolean(data.isCurrent),
        gradeLevel: data.grade || null,
        description: data.description || null
      },
    });

    return NextResponse.json(educationRecord);
  } catch (error) {
    console.error('Error creating education record:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create education record' },
      { status: 500 }
    );
  }
}