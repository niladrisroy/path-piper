import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { prisma } from '@/lib/prisma'
import { supabase } from '@/lib/supabase'
import { cookies } from 'next/headers'



export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Fetching education history')

    // Get user from session
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('sb-access-token')?.value

    if (!accessToken) {
      console.log('❌ No access token found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)

    if (authError || !user) {
      console.log('❌ Authentication failed')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch education history for the authenticated user using Prisma
    const educationHistory = await prisma.studentEducationHistory.findMany({
      where: {
        studentId: user.id
      },
      orderBy: {
        startDate: 'desc'
      },
      select: {
        id: true,
        institutionId: true,
        institutionName: true,
        institutionTypeId: true,
        degreeProgram: true,
        fieldOfStudy: true,
        subjects: true,
        startDate: true,
        endDate: true,
        isCurrent: true,
        gradeLevel: true,
        gpa: true,
        achievements: true,
        description: true,
        institutionVerified: true, // Explicitly select this field
        createdAt: true,
        updatedAt: true,
        institutionType: {
          select: {
            id: true,
            name: true,
            slug: true,
            category: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            }
          }
        }
      }
    })

    // Transform database fields to match the frontend interface
    const transformedEducation = educationHistory.map(entry => {
      console.log('🔍 Education entry debug:', {
        id: entry.id,
        institutionName: entry.institutionName,
        institutionVerified: entry.institutionVerified,
        institution_verified_raw: entry.institutionVerified,
        institution_verified_type: typeof entry.institutionVerified,
        all_fields: Object.keys(entry),
        raw_entry: entry
      })
      
      // Ensure institutionVerified is properly handled
      const institutionVerified = entry.institutionVerified !== undefined ? entry.institutionVerified : null;
      
      return {
        id: entry.id,
        institutionId: entry.institutionId || '',
        institutionName: entry.institutionName,
        institutionCategory: entry.institutionType?.category?.slug || '',
        institutionType: entry.institutionTypeId ? entry.institutionTypeId.toString() : '',
        institutionTypeName: entry.institutionType?.name || '', // Add the type name
        institutionVerified: institutionVerified, // Explicitly handle the field
        degree: entry.degreeProgram || '',
        fieldOfStudy: entry.fieldOfStudy || '',
        subjects: Array.isArray(entry.subjects) ? entry.subjects : [],
        startDate: entry.startDate ? entry.startDate.toISOString().split('T')[0] : '',
        endDate: entry.endDate ? entry.endDate.toISOString().split('T')[0] : '',
        isCurrent: entry.isCurrent || false,
        grade: entry.gradeLevel || '',
        description: entry.description || ''
      }
    })

    console.log('🔍 Final transformed education data:', transformedEducation)

    return NextResponse.json({ education: transformedEducation })
  } catch (error) {
    console.error('Error in GET /api/education:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('📝 Creating education record')

    // Get user from session using cookies (same as GET method)
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('sb-access-token')?.value

    if (!accessToken) {
      console.log('❌ No access token found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)

    if (authError || !user) {
      console.log('❌ Authentication failed')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = user.id
    const data = await request.json();

    // Check if this is a batch save or single entry
    if (data.education && Array.isArray(data.education)) {
      // Batch save - for compatibility with existing code
      const savedEntries = [];
      for (const entry of data.education) {
        if (!entry.institutionName || !entry.institutionType) continue;
        
        const educationRecord = await prisma.studentEducationHistory.create({
          data: {
            studentId: userId,
            institutionId: entry.institutionId || null,
            institutionName: entry.institutionName,
            institutionTypeId: parseInt(entry.institutionType),
            degreeProgram: entry.degree || null,
            fieldOfStudy: entry.fieldOfStudy || null,
            subjects: Array.isArray(entry.subjects) ? entry.subjects : [],
            startDate: entry.startDate ? new Date(entry.startDate) : null,
            endDate: entry.endDate ? new Date(entry.endDate) : null,
            isCurrent: Boolean(entry.isCurrent),
            gradeLevel: entry.grade || null,
            description: entry.description || null,
            institutionVerified: entry.institutionId ? null : undefined // null if institution selected, undefined if manual entry
          },
        });
        savedEntries.push(educationRecord);
      }
      return NextResponse.json({ education: savedEntries });
    } else {
      // Single entry save
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
          institutionId: data.institutionId || null,
          institutionName: data.institutionName,
          institutionTypeId: parseInt(data.institutionTypeId),
          degreeProgram: data.degree || null,
          fieldOfStudy: data.fieldOfStudy || null,
          subjects: Array.isArray(data.subjects) ? data.subjects : [],
          startDate: data.startDate ? new Date(data.startDate) : null,
          endDate: data.endDate ? new Date(data.endDate) : null,
          isCurrent: Boolean(data.isCurrent),
          gradeLevel: data.grade || null,
          description: data.description || null,
          institutionVerified: data.institutionId ? null : undefined // null if institution selected, undefined if manual entry
        },
      });

      return NextResponse.json(educationRecord);
    }
  } catch (error) {
    console.error('Error creating education record:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create education record' },
      { status: 500 }
    );
  }
}