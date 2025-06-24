
import { Resend } from 'resend';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const isDevelopment = process.env.NODE_ENV === 'development';

let resend: Resend;
try {
  resend = new Resend(RESEND_API_KEY || (isDevelopment ? 'dummy_key' : undefined));
} catch (error) {
  console.warn('Email service initialization failed:', error);
  resend = {
    emails: {
      send: async () => {
        console.log('Email sending mocked - development mode');
        return { data: { id: 'mocked_id' } };
      }
    }
  } as Resend;
}

// Mock email sending for development
async function mockSendEmail() {
  console.log('Email sending mocked due to missing API key');
  return { success: true, data: { id: 'mocked_id' } };
}

export type EmailTemplate = 'verification' | 'parent-approval' | 'password-reset';

export async function sendEmail(
  template: EmailTemplate,
  to: string,
  data: {
    userName?: string;
    verificationLink?: string;
    studentName?: string;
    approvalLink?: string;
    resetLink?: string;
  }
) {
  try {
    let subject = '';
    let html = '';

    switch (template) {
      case 'verification':
        subject = 'Verify your PathPiper account';
        html = `
          <h1>Welcome to PathPiper!</h1>
          <p>Hi ${data.userName},</p>
          <p>Please verify your email address by clicking the link below:</p>
          <a href="${data.verificationLink}">Verify Email</a>
        `;
        break;

      case 'parent-approval':
        subject = 'Parent Approval Required for PathPiper Account';
        html = `
          <h1>PathPiper Parent Approval Request</h1>
          <p>Dear Parent/Guardian,</p>
          <p>${data.studentName} has created an account on PathPiper and requires your approval to proceed.</p>
          <p>Please review and approve their account by clicking the link below:</p>
          <a href="${data.approvalLink}">Review and Approve</a>
        `;
        break;

      case 'password-reset':
        subject = 'Reset your PathPiper password';
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #14b8a6; margin: 0;">PathPiper</h1>
            </div>
            
            <h2 style="color: #1f2937; margin-bottom: 20px;">Reset Your Password</h2>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">
              Hi ${data.userName || 'there'},
            </p>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">
              We received a request to reset your PathPiper account password. Click the button below to reset it:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.resetLink}" 
                 style="display: inline-block; background-color: #14b8a6; color: white; padding: 12px 30px; 
                        text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; line-height: 1.5;">
              If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.
            </p>
            
            <p style="color: #6b7280; font-size: 14px; line-height: 1.5;">
              This link will expire in 1 hour for security reasons.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <p style="color: #9ca3af; font-size: 12px; text-align: center;">
              © ${new Date().getFullYear()} PathPiper. All rights reserved.
            </p>
          </div>
        `;
        break;
    }

    const result = await resend.emails.send({
      from: 'PathPiper <noreply@pathpiper.com>',
      to: [to],
      subject,
      html
    });

    return { success: true, data: result };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error };
  }
}
