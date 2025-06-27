
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const parentId = cookieStore.get('parent_id')?.value
    const parentSession = cookieStore.get('parent_session')?.value

    if (!parentId || !parentSession) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { childId } = await request.json()

    if (!childId) {
      return NextResponse.json(
        { success: false, error: 'Child ID is required' },
        { status: 400 }
      )
    }

    // Verify that the child belongs to this parent
    const child = await prisma.profile.findFirst({
      where: {
        id: childId,
        parentId: parseInt(parentId),
        role: 'student'
      }
    })

    if (!child) {
      return NextResponse.json(
        { success: false, error: 'Child not found or not authorized' },
        { status: 404 }
      )
    }

    // Update the parent_verified field to true
    await prisma.profile.update({
      where: { id: childId },
      data: { parentVerified: true }
    })

    console.log(`✅ Parent approved account for child ${childId}`)

    return NextResponse.json({
      success: true,
      message: 'Child account approved successfully'
    })

  } catch (error) {
    console.error('Error approving child account:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to approve account' },
      { status: 500 }
    )
  }
}
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    // Get parent session from cookies
    const cookies = request.headers.get('cookie') || '';
    const sessionCookie = cookies
      .split(';')
      .find(c => c.trim().startsWith('parent_session='));
    
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const sessionValue = sessionCookie.split('=')[1];
    const decoded = Buffer.from(sessionValue, 'base64').toString('utf-8');
    const parentEmail = decoded.split(':')[0];

    // Get parent profile
    const parentProfile = await prisma.parentProfile.findFirst({
      where: { email: parentEmail }
    });

    if (!parentProfile) {
      return NextResponse.json({ error: 'Parent not found' }, { status: 404 });
    }

    const { childId } = await request.json();

    if (!childId) {
      return NextResponse.json({ error: 'Child ID is required' }, { status: 400 });
    }

    // Verify the child belongs to this parent
    const child = await prisma.profile.findFirst({
      where: {
        id: childId,
        parentId: parentProfile.id
      }
    });

    if (!child) {
      return NextResponse.json({ error: 'Child not found or not linked to this parent' }, { status: 404 });
    }

    // Update the child's parentVerified status
    await prisma.profile.update({
      where: { id: childId },
      data: { parentVerified: true }
    });

    console.log(`✅ Parent ${parentEmail} approved child ${childId}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error approving child:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
