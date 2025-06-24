
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
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="text-align: center; padding: 20px; background-color: #f8fafc;">
              <h1 style="color: #0f172a; margin: 0;">PathPiper Password Reset</h1>
            </div>
            <div style="padding: 30px;">
              <p style="font-size: 16px; color: #475569;">Hi ${data.userName},</p>
              <p style="font-size: 16px; color: #475569;">
                We received a request to reset your password for your PathPiper account. 
                Click the button below to create a new password:
              </p>
              <div style="text-align: center; margin: 32px 0;">
                <a href="${data.resetLink}" 
                   style="background-color: #0ea5e9; color: white; padding: 12px 24px; 
                          text-decoration: none; border-radius: 8px; font-weight: 600; 
                          display: inline-block;">
                  Reset Password
                </a>
              </div>
              <p style="font-size: 14px; color: #64748b;">
                This link will expire in 1 hour for security reasons.
              </p>
              <p style="font-size: 14px; color: #64748b;">
                If you didn't request this password reset, you can safely ignore this email.
              </p>
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
              <p style="font-size: 12px; color: #94a3b8; text-align: center;">
                © ${new Date().getFullYear()} PathPiper. All rights reserved.
              </p>
            </div>
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
