import EmailConfig from '../config/email.config';
import { logger } from '../config/logger.config';
import { EMAIL_TEMPLATES } from '../utils/constants';

export class EmailService {
  /**
   * Send OTP email to user
   */
  public static async sendOtpEmail(to: string, otpCode: string): Promise<void> {
    try {
      const subject = EMAIL_TEMPLATES.OTP_SUBJECT;
      const html = EMAIL_TEMPLATES.OTP_TEMPLATE(otpCode);
      const text = `Your VibesMatch verification code is: ${otpCode}. This code will expire in 5 minutes.`;

      await EmailConfig.sendEmail({
        to,
        subject,
        html,
        text,
      });

      logger.info('OTP email sent successfully', {
        to,
        codeLength: otpCode.length,
      });
    } catch (error) {
      logger.error('Failed to send OTP email', {
        error,
        to,
      });
      throw new Error('Failed to send verification email');
    }
  }

  /**
   * Send welcome email to new user
   */
  public static async sendWelcomeEmail(to: string, name: string): Promise<void> {
    try {
      const subject = 'Welcome to VibesMatch!';
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #e91e63;">Welcome to VibesMatch, ${name}!</h2>
          <p>Thank you for joining our community. We're excited to help you find meaningful connections.</p>
          <p>Here are some tips to get started:</p>
          <ul>
            <li>Complete your profile with great photos</li>
            <li>Write an engaging bio that shows your personality</li>
            <li>Be authentic and genuine in your interactions</li>
            <li>Stay safe and report any inappropriate behavior</li>
          </ul>
          <p>Happy matching!</p>
          <p>The VibesMatch Team</p>
        </div>
      `;
      const text = `Welcome to VibesMatch, ${name}! Thank you for joining our community.`;

      await EmailConfig.sendEmail({
        to,
        subject,
        html,
        text,
      });

      logger.info('Welcome email sent successfully', { to, name });
    } catch (error) {
      logger.error('Failed to send welcome email', { error, to, name });
      // Don't throw error for welcome email as it's not critical
    }
  }

  /**
   * Send password reset email
   */
  public static async sendPasswordResetEmail(to: string, resetToken: string): Promise<void> {
    try {
      const resetUrl = `${process.env.API_BASE_URL}/reset-password?token=${resetToken}`;
      const subject = 'Reset Your VibesMatch Password';
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #e91e63;">Reset Your Password</h2>
          <p>You requested to reset your password for your VibesMatch account.</p>
          <p>Click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #e91e63; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a>
          </div>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all;">${resetUrl}</p>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this password reset, please ignore this email.</p>
        </div>
      `;
      const text = `Reset your VibesMatch password by visiting: ${resetUrl}`;

      await EmailConfig.sendEmail({
        to,
        subject,
        html,
        text,
      });

      logger.info('Password reset email sent successfully', { to });
    } catch (error) {
      logger.error('Failed to send password reset email', { error, to });
      throw new Error('Failed to send password reset email');
    }
  }

  /**
   * Send account verification email
   */
  public static async sendVerificationEmail(to: string, verificationToken: string): Promise<void> {
    try {
      const verificationUrl = `${process.env.API_BASE_URL}/verify-email?token=${verificationToken}`;
      const subject = 'Verify Your VibesMatch Account';
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #e91e63;">Verify Your Account</h2>
          <p>Please verify your email address to complete your VibesMatch account setup.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background-color: #e91e63; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Verify Email</a>
          </div>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all;">${verificationUrl}</p>
          <p>This link will expire in 24 hours.</p>
        </div>
      `;
      const text = `Verify your VibesMatch account by visiting: ${verificationUrl}`;

      await EmailConfig.sendEmail({
        to,
        subject,
        html,
        text,
      });

      logger.info('Verification email sent successfully', { to });
    } catch (error) {
      logger.error('Failed to send verification email', { error, to });
      throw new Error('Failed to send verification email');
    }
  }

  /**
   * Test email configuration
   */
  public static async testEmailConfiguration(): Promise<boolean> {
    try {
      return await EmailConfig.verifyConnection();
    } catch (error) {
      logger.error('Email configuration test failed', { error });
      return false;
    }
  }
}

export default EmailService;