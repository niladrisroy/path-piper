
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendEmail } from '@/lib/email';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    console.log('Password reset request received');
    
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    console.log('Processing password reset for email:', email);

    // Check if user exists in our database
    const userProfile = await prisma.profile.findFirst({
      where: { 
        OR: [
          { email: email },
          { id: { in: await getUserIdsByEmail(email) } }
        ]
      }
    });

    // Always return success to prevent email enumeration attacks
    // But only send email if user actually exists
    if (userProfile) {
      console.log('User found, sending reset email');
      
      // Generate password reset link using Supabase
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
      });

      if (error) {
        console.error('Supabase password reset error:', error);
        // Still return success to prevent email enumeration
      } else {
        console.log('Supabase reset initiated successfully');
        
        // Send our custom email
        const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?email=${encodeURIComponent(email)}`;
        
        await sendEmail('password-reset', email, {
          userName: userProfile.firstName || 'User',
          resetLink: resetLink
        });
        
        console.log('Reset email sent successfully');
      }
    } else {
      console.log('User not found, but returning success for security');
    }

    return NextResponse.json({
      success: true,
      message: 'If an account with this email exists, you will receive password reset instructions.'
    });

  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
}

// Helper function to get user IDs by email from Supabase auth
async function getUserIdsByEmail(email: string): Promise<string[]> {
  try {
    // This is a workaround since we can't directly query Supabase auth users
    // We'll try to get user info if they exist
    const { data, error } = await supabase.auth.admin.listUsers();
    
    if (error || !data?.users) {
      return [];
    }
    
    return data.users
      .filter(user => user.email === email)
      .map(user => user.id);
  } catch (error) {
    console.error('Error getting user IDs by email:', error);
    return [];
  }
}
