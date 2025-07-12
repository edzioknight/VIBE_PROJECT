import nodemailer from 'nodemailer';
import { logger } from './logger.config';

class EmailConfig {
  private static transporter: nodemailer.Transporter;

  public static getTransporter(): nodemailer.Transporter {
    if (!EmailConfig.transporter) {
      const smtpConfig = {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        tls: {
          rejectUnauthorized: false,
        },
      };

      EmailConfig.transporter = nodemailer.createTransporter(smtpConfig);

      // Verify connection configuration
      EmailConfig.transporter.verify((error, success) => {
        if (error) {
          logger.error('Email configuration error', { error });
        } else {
          logger.info('Email server is ready to take our messages');
        }
      });
    }

    return EmailConfig.transporter;
  }

  public static async sendEmail(options: {
    to: string;
    subject: string;
    html: string;
    text?: string;
  }): Promise<void> {
    try {
      const transporter = EmailConfig.getTransporter();
      
      const mailOptions = {
        from: {
          name: process.env.FROM_NAME || 'VibesMatch',
          address: process.env.FROM_EMAIL || process.env.SMTP_USER || 'noreply@vibesmatch.com',
        },
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      const info = await transporter.sendMail(mailOptions);
      
      logger.info('Email sent successfully', {
        messageId: info.messageId,
        to: options.to,
        subject: options.subject,
      });
    } catch (error) {
      logger.error('Failed to send email', {
        error,
        to: options.to,
        subject: options.subject,
      });
      throw error;
    }
  }

  public static async verifyConnection(): Promise<boolean> {
    try {
      const transporter = EmailConfig.getTransporter();
      await transporter.verify();
      return true;
    } catch (error) {
      logger.error('Email connection verification failed', { error });
      return false;
    }
  }
}

export default EmailConfig;