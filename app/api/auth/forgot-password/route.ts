
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

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
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
      
      try {
        // Generate a manual reset token instead of using Supabase's email system
        const resetToken = Buffer.from(`${email}:${Date.now()}:${Math.random()}`).toString('base64');
        
        // Store the reset token temporarily (you might want to use a database for this in production)
        // For now, we'll use Supabase Auth but handle the email ourselves
        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `https://pathpiper.replit.app/reset-password?token=${resetToken}`,
          options: {
            // Set session to last 30 minutes (1800 seconds)
            sessionDuration: 1800
          }
        });

        if (error) {
          console.error('Supabase password reset error:', error);
          // Continue anyway to send our custom email
        } else {
          console.log('Supabase reset initiated successfully');
        }
        
        // Always send our custom email regardless of Supabase email status
        const resetLink = `https://pathpiper.replit.app/reset-password?email=${encodeURIComponent(email)}&source=pathpiper`;
        
        const emailResult = await sendEmail('password-reset', email, {
          userName: userProfile?.firstName || 'User',
          resetLink: resetLink
        });
        
        if (emailResult.success) {
          console.log('Custom reset email sent successfully');
        } else {
          console.error('Failed to send custom reset email:', 'error' in emailResult ? emailResult.error : 'Unknown error');
        }
      } catch (emailError) {
        console.error('Error in password reset process:', emailError);
        // Continue with success response for security
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
