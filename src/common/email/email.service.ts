import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import sgMail from '@sendgrid/mail';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly fromEmail: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('SENDGRID_API_KEY');
    if (apiKey) {
      sgMail.setApiKey(apiKey);
    }
    this.fromEmail = this.configService.get<string>('EMAIL_FROM') || 'no-reply@example.com';
  }

  async sendEmail(to: string, subject: string, text: string, html?: string): Promise<void> {
    try {
      await sgMail.send({
        to,
        from: this.fromEmail,
        subject,
        text,
        html: html || text,
      });
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}: ${error?.message || error}`);
      throw new InternalServerErrorException('Failed to send email');
    }
  }

  async sendPasswordResetOtpEmail(to: string, otpCode: string): Promise<void> {
    const subject = 'Your password reset code';
    const text = `Use this one-time code to reset your password: ${otpCode}\nThis code expires in 10 minutes.`;
    const html = `<p>Use this one-time code to reset your password:</p><p style="font-size:20px;"><b>${otpCode}</b></p><p>This code expires in 10 minutes.</p>`;
    await this.sendEmail(to, subject, text, html);
  }
}


