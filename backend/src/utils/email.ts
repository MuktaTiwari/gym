import nodemailer from "nodemailer";
import { env } from "../config/env";


interface WelcomeEmailOptions {
  email: string;
  name: string;
  role: string;
  contextMessage?: string;
  setupToken?: string;
}

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn(`[Email] SMTP not configured — skipping email to ${options.to} (subject: "${options.subject}")`);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM || "noreply@fitcore.com",
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  });

  console.log(`[Email] Sent to ${options.to}. Message ID: ${info.messageId}`);
};


export const sendWelcomeEmail = async ({ email, name, role, contextMessage, setupToken }: WelcomeEmailOptions) => {
  const roleDisplay = role.replace(/_/g, ' ').toLowerCase();
  const context = contextMessage ? ` ${contextMessage}` : "";
  
  const frontendUrl = env.FRONTEND_URL || "http://localhost:5174";
  const actionSection = setupToken 
    ? `<p style="color: #374151; font-size: 16px;">Please click the button below to set up your password and access your dashboard:</p>
       <a href="${frontendUrl}/set-password?token=${setupToken}" style="display:inline-block;padding:12px 24px;background-color:#4F46E5;color:#fff;font-weight:bold;text-decoration:none;border-radius:6px;margin-top:10px;margin-bottom:10px;">Set Password</a>`
    : `<p style="color: #374151; font-size: 16px;">Please log in to access your dashboard and get started.</p>`;

  const emailSubject = setupToken ? `Action Required: Set up your FitCore Account` : `Welcome to FitCore Gym Management - Account Created`;
  const emailText = `Hello ${name},\n\nYour ${roleDisplay} account${context} has been successfully created.\n\nYour login email is: ${email}\n\n${setupToken ? `Please set your password at: ${frontendUrl}/set-password?token=${setupToken}` : "Please log in to access your dashboard."}`;
  
  return sendEmail({
    to: email,
    subject: emailSubject,
    text: emailText,
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; padding: 30px; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #111827; margin: 0; font-size: 24px;">Welcome to FitCore Gym Management!</h2>
        </div>
        <p style="color: #374151; font-size: 16px;">Hello <strong>${name}</strong>,</p>
        <p style="color: #374151; font-size: 16px;">Your ${roleDisplay} account${context} has been successfully created.</p>
        <p style="color: #374151; font-size: 16px;">Your login email is: <strong style="color: #4F46E5;">${email}</strong></p>
        <br/>
        <div style="text-align: center;">
          ${actionSection}
        </div>
        <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
        <p style="color: #6b7280; font-size: 14px; text-align: center; margin: 0;">Best regards,<br/>The FitCore Team</p>
      </div>
    `
  }).catch(err => console.error("[Email] Failed to send welcome email:", err));
};
