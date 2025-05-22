
import { Resend } from 'resend';

const RESEND_API_KEY = process.env.RESEND_API_KEY;

if (!RESEND_API_KEY) {
  console.warn('Missing RESEND_API_KEY environment variable. Email functionality will be limited.');
}

const resend = new Resend(RESEND_API_KEY);

// Mock email sending for development if API key is missing
async function mockSendEmail() {
  console.log('Email sending mocked due to missing API key');
  return { success: true, data: { id: 'mocked_id' } };
}

export type EmailTemplate = 'verification' | 'parent-approval';

export async function sendEmail(
  template: EmailTemplate,
  to: string,
  data: {
    userName?: string;
    verificationLink?: string;
    studentName?: string;
    approvalLink?: string;
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
