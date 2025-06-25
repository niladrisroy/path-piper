
import { SendMailClient } from "zeptomail";

const ZEPTOMAIL_URL = "api.zeptomail.in/";
const ZEPTOMAIL_TOKEN = process.env.ZEPTOMAIL_TOKEN || "Zoho-enczapikey PHtE6r0IE7q/3mUv80UHsP/pRc+tZownrO8zflYS5o1LWfZSGU1VqNl/kTKxqht8XPkWR/SfyN5t5Oycsu6BITzsYG4dWmqyqK3sx/VYSPOZsbq6x00ctF4SfkLVVoDmcd9u1iXRuNnaNA==";
const isDevelopment = process.env.NODE_ENV === 'development';

let zeptoClient: SendMailClient;
try {
  zeptoClient = new SendMailClient({
    url: ZEPTOMAIL_URL,
    token: ZEPTOMAIL_TOKEN
  });
} catch (error) {
  console.warn('ZeptoMail service initialization failed:', error);
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
    console.log(`Attempting to send ${template} email to ${to}`);
    
    // Check if we're in development mode without proper API key
    if (!ZEPTOMAIL_TOKEN && isDevelopment) {
      console.log('Development mode: Mocking email send');
      return mockSendEmail();
    }

    if (!ZEPTOMAIL_TOKEN) {
      console.error('ZEPTOMAIL_TOKEN is not configured');
      return { success: false, error: 'Email service not configured' };
    }

    let subject = '';
    let htmlbody = '';

    switch (template) {
      case 'verification':
        subject = 'Verify your PathPiper account';
        htmlbody = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #14b8a6; margin: 0;">PathPiper</h1>
            </div>
            
            <h2 style="color: #1f2937; margin-bottom: 20px;">Welcome to PathPiper!</h2>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">
              Hi ${data.userName || 'there'},
            </p>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">
              Please verify your email address by clicking the button below:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.verificationLink}" 
                 style="display: inline-block; background-color: #14b8a6; color: white; padding: 12px 30px; 
                        text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                Verify Email
              </a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <p style="color: #9ca3af; font-size: 12px; text-align: center;">
              © ${new Date().getFullYear()} PathPiper. All rights reserved.
            </p>
          </div>
        `;
        break;

      case 'parent-approval':
        subject = 'Parent Approval Required for PathPiper Account';
        htmlbody = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #14b8a6; margin: 0;">PathPiper</h1>
            </div>
            
            <h2 style="color: #1f2937; margin-bottom: 20px;">Parent Approval Request</h2>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">
              Dear Parent/Guardian,
            </p>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">
              ${data.studentName} has created an account on PathPiper and requires your approval to proceed.
            </p>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">
              Please review and approve their account by clicking the button below:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.approvalLink}" 
                 style="display: inline-block; background-color: #14b8a6; color: white; padding: 12px 30px; 
                        text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                Review and Approve
              </a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <p style="color: #9ca3af; font-size: 12px; text-align: center;">
              © ${new Date().getFullYear()} PathPiper. All rights reserved.
            </p>
          </div>
        `;
        break;

      case 'password-reset':
        subject = 'Reset your PathPiper password';
        htmlbody = `
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

    console.log(`Sending email with subject: ${subject}`);

    const result = await zeptoClient.sendMail({
      "from": {
        "address": "noreply@pathpiper.com",
        "name": "PathPiper"
      },
      "to": [
        {
          "email_address": {
            "address": to,
            "name": data.userName || "User"
          }
        }
      ],
      "subject": subject,
      "htmlbody": htmlbody
    });

    console.log('Email sent successfully:', result);
    return { success: true, data: result };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error };
  }
}
