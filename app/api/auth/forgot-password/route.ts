
import { NextRequest, NextResponse } from 'next/server';
import { createClient, User } from '@supabase/supabase-js';
import { sendEmail } from '@/lib/email';
import { prisma } from '@/lib/prisma';

// Initialize Supabase client with service role key for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

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

    // Check if user exists in Supabase Auth
    const { data: authUsers, error: listError } = await supabase.auth.admin.listUsers();
    
    let userExists = false;
    let userProfile = null;

    if (!listError && authUsers?.users) {
      const authUser = authUsers.users.find((user: User) => user.email === email);
      if (authUser) {
        userExists = true;
        // Get the user's profile for the name
        userProfile = await prisma.profile.findUnique({
          where: { id: authUser.id }
        });
        console.log('User found in Supabase Auth');
      }
    }

    // Always return success to prevent email enumeration attacks
    // But only send email if user actually exists
    if (userExists) {
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
        
        const emailResult = await sendEmail('password-reset', email, {
          userName: userProfile?.firstName || 'User',
          resetLink: resetLink
        });
        
        if (emailResult.success) {
          console.log('Reset email sent successfully');
        } else {
          console.error('Failed to send reset email:', emailResult.error);
        }
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
