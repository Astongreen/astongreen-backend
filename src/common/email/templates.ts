type PasswordResetTemplateInput = {
    appName: string;
    otpCode: string;
    expiresInMinutes: number;
    supportEmail?: string;
    logoUrl?: string;
};

export function renderPasswordResetOtpEmail(input: PasswordResetTemplateInput) {
    const { appName, otpCode, expiresInMinutes, supportEmail, logoUrl } = input;

    const subject = `${appName} password reset code`;

    const text = [
        `You requested to reset your ${appName} password.`,
        ``,
        `Your one-time code: ${otpCode}`,
        `This code expires in ${expiresInMinutes} minutes.`,
        ``,
        supportEmail ? `If you didn’t request this, contact us at ${supportEmail}.` : '',
        `— ${appName}`,
    ]
        .filter(Boolean)
        .join('\n');

    // Color theme inspired by AstonGreens UI
    const colors = {
        background: '#F4FBF7',
        card: '#FFFFFF',
        primary: '#2BB673',
        primaryDark: '#1F8A57',
        text: '#233044',
        muted: '#5A6B7B',
        divider: '#E6EFE8',
        badgeBg: '#E7F7EE',
    };

    const html = `<!doctype html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>${subject}</title>
  </head>
  <body style="margin:0;padding:0;background:${colors.background};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Ubuntu,'Helvetica Neue',Arial,'Noto Sans',sans-serif;color:${colors.text};">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${colors.background};padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="width:600px;max-width:92%;background:${colors.card};border-radius:14px;border:1px solid ${colors.divider};overflow:hidden;">
            <tr>
              <td style="padding:16px 24px;background:linear-gradient(90deg, ${colors.primary} 0%, ${colors.primaryDark} 100%);color:#fff;">
                <div style="display:flex;align-items:center;gap:10px;">
                  ${logoUrl ? `<img src="${logoUrl}" alt="${appName} logo" style="height:28px;display:block;border:none;outline:none;text-decoration:none;" />` : ``}
                  <div>
                    <div style="font-size:13px;opacity:.95;">${appName}</div>
                    <div style="font-size:18px;font-weight:600;">Password reset code</div>
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:24px;">
                <p style="margin:0 0 12px 0;font-size:16px;color:${colors.text};">You requested to reset your ${appName} password.</p>
                <p style="margin:0 0 16px 0;font-size:14px;color:${colors.muted};">Use the one-time code below to continue. This code will expire in ${expiresInMinutes} minutes.</p>
                <div style="margin:16px 0 20px 0;">
                  <div style="display:inline-block;padding:14px 18px;border-radius:12px;background:${colors.badgeBg};border:1px dashed ${colors.primary};font-size:22px;letter-spacing:2px;color:${colors.primaryDark};font-weight:700;">${otpCode}</div>
                </div>
                <p style="margin:0 0 8px 0;font-size:14px;color:${colors.muted};">If you didn’t request this, you can safely ignore this email.</p>
                ${supportEmail
            ? `<p style="margin:0 0 4px 0;font-size:14px;color:${colors.muted};">Need help? Contact <a href="mailto:${supportEmail}" style="color:${colors.primaryDark};text-decoration:none;">${supportEmail}</a>.</p>`
            : ''
        }
              </td>
            </tr>
            <tr>
              <td style="padding:16px 24px;border-top:1px solid ${colors.divider};background:${colors.background};">
                <div style="font-size:12px;color:${colors.muted};">© ${new Date().getFullYear()} ${appName}. All rights reserved.</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

    return { subject, text, html };
}

type NewUserCredentialsTemplateInput = {
    appName: string;
    userEmail: string;
    password: string;
    loginUrl?: string;
    supportEmail?: string;
    role?: string;
    logoUrl?: string;
};

export function renderNewUserCredentialsEmail(input: NewUserCredentialsTemplateInput) {
    const { appName, userEmail, password, loginUrl, supportEmail, role, logoUrl } = input;
    const subject = `Welcome to ${appName}! Your login details`;

    const text = [
        `Welcome to ${appName}!`,
        ``,
        `You have been added by the administrator. Here are your login details:`,
        `Email: ${userEmail}`,
        `Password: ${password}`,
        role ? `Role: ${role}` : '',
        loginUrl ? `Login link: ${loginUrl}` : '',
        ``,
        `For your security, please log in and change your password immediately.`,
        supportEmail ? `Need help? Contact us at ${supportEmail}.` : '',
        `— ${appName}`,
    ].filter(Boolean).join('\n');

    const colors = {
        background: '#F4FBF7',
        card: '#FFFFFF',
        primary: '#2BB673',
        primaryDark: '#1F8A57',
        text: '#233044',
        muted: '#5A6B7B',
        divider: '#E6EFE8',
        badgeBg: '#E7F7EE',
    };

    const html = `<!doctype html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>${subject}</title>
  </head>
  <body style="margin:0;padding:0;background:${colors.background};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Ubuntu,'Helvetica Neue',Arial,'Noto Sans',sans-serif;color:${colors.text};">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${colors.background};padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="width:600px;max-width:92%;background:${colors.card};border-radius:14px;border:1px solid ${colors.divider};overflow:hidden;">
            <tr>
              <td style="padding:16px 24px;background:linear-gradient(90deg, ${colors.primary} 0%, ${colors.primaryDark} 100%);color:#fff;">
                <div style="display:flex;align-items:center;gap:10px;">
                  ${logoUrl ? `<img src="${logoUrl}" alt="${appName} logo" style="height:28px;display:block;border:none;outline:none;text-decoration:none;" />` : ``}
                  <div>
                    <div style="font-size:13px;opacity:.95;">${appName}</div>
                    <div style="font-size:18px;font-weight:600;">Welcome! Your account is ready</div>
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:24px;">
                <p style="margin:0 0 12px 0;font-size:16px;color:${colors.text};">Welcome to ${appName}!</p>
                <p style="margin:0 0 16px 0;font-size:14px;color:${colors.muted};">An administrator has created an account for you. Use the credentials below to sign in.</p>
                <table role="presentation" cellspacing="0" cellpadding="0" style="margin:8px 0 16px 0;">
                  <tr>
                    <td style="padding:8px 0;color:${colors.muted};font-size:14px;width:90px;">Email</td>
                    <td style="padding:8px 0;color:${colors.text};font-size:14px;font-weight:600;">${userEmail}</td>
                  </tr>
                  ${role ? `
                  <tr>
                    <td style="padding:8px 0;color:${colors.muted};font-size:14px;">Role</td>
                    <td style="padding:8px 0;color:${colors.text};font-size:14px;font-weight:600;">${role}</td>
                  </tr>` : ``}
                  <tr>
                    <td style="padding:8px 0;color:${colors.muted};font-size:14px;">Password</td>
                    <td style="padding:8px 0;">
                      <span style="display:inline-block;padding:10px 12px;border-radius:10px;background:${colors.badgeBg};border:1px dashed ${colors.primary};font-size:14px;color:${colors.primaryDark};font-weight:700;">${password}</span>
                    </td>
                  </tr>
                </table>
                ${loginUrl
            ? `<div style="margin:12px 0 18px 0;">
                        <a href="${loginUrl}" style="display:inline-block;background:${colors.primary};color:#fff;text-decoration:none;padding:10px 14px;border-radius:10px;font-size:14px;font-weight:600;">Go to Login</a>
                       </div>`
            : ''
        }
                <p style="margin:0 0 8px 0;font-size:14px;color:${colors.muted};">For your security, please sign in and change your password immediately.</p>
                ${supportEmail
            ? `<p style="margin:0 0 4px 0;font-size:14px;color:${colors.muted};">Need help? Contact <a href="mailto:${supportEmail}" style="color:${colors.primaryDark};text-decoration:none;">${supportEmail}</a>.</p>`
            : ''
        }
              </td>
            </tr>
            <tr>
              <td style="padding:16px 24px;border-top:1px solid ${colors.divider};background:${colors.background};">
                <div style="font-size:12px;color:${colors.muted};">© ${new Date().getFullYear()} ${appName}. All rights reserved.</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

    return { subject, text, html };
}


