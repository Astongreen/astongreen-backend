import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
type SmtpTransporter = { sendMail(mailOptions: any): Promise<any> };
import { renderPasswordResetOtpEmail, renderNewUserCredentialsEmail } from './templates';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly fromEmail: string;
  private readonly transporter: SmtpTransporter;
  private readonly appName: string;
  private readonly supportEmail?: string;
  private readonly logoUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.fromEmail = this.configService.get<string>('EMAIL_FROM') || 'no-reply@example.com';
    this.appName = this.configService.get<string>('APP_NAME') || 'AstonGreen';
    this.supportEmail = this.configService.get<string>('SUPPORT_EMAIL') || this.fromEmail;
    const defaultLogo = 'https://www.astongreens.com/web/image/website/1/logo/Astongreens?unique=e747efb';
    this.logoUrl = this.configService.get<string>('APP_LOGO_URL') || defaultLogo;

    const host = this.configService.get<string>('SMTP_HOST');
    const portStr = this.configService.get<string>('SMTP_PORT', '587');
    const port = parseInt(portStr, 10);
    const user = this.configService.get<string>('SMTP_USER') || this.configService.get<string>('SMTP_USERNAME');
    const pass = this.configService.get<string>('SMTP_PASS') || this.configService.get<string>('SMTP_PASSWORD');
    const secureEnv = this.configService.get<string>('SMTP_SECURE');
    const secure = secureEnv ? secureEnv === 'true' : port === 465;

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: user && pass ? { user, pass } : undefined,
    }) as unknown as SmtpTransporter;
  }

  async sendEmail(to: string, subject: string, text: string, html?: string): Promise<void> {
    try {
      await this.transporter.sendMail({
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
    const { subject, text, html } = renderPasswordResetOtpEmail({
      appName: this.appName,
      otpCode,
      expiresInMinutes: 10,
      supportEmail: this.supportEmail,
      logoUrl: this.logoUrl,
    });
    await this.sendEmail(to, subject, text, html);
  }

  async sendNewUserCredentialsEmail(to: string, userEmail: string, password: string, role?: string): Promise<void> {
    const { subject, text, html } = renderNewUserCredentialsEmail({
      appName: this.appName,
      userEmail,
      password,
      supportEmail: this.supportEmail,
      role,
      logoUrl: this.logoUrl,
    });
    await this.sendEmail(to, subject, text, html);
  }
}


