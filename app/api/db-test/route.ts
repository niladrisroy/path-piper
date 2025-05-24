
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Test the database connection
    const profileCount = await prisma.profile.count();
    
    // Get a sample of profiles for verification
    const profiles = await prisma.profile.findMany({
      take: 5,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        role: true
      }
    });
    
    return NextResponse.json({
      success: true,
      databaseConnected: true,
      profileCount,
      sampleProfiles: profiles
    });
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({
      success: false,
      databaseConnected: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
