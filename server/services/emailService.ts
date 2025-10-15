import nodemailer from "nodemailer";

interface SendEmailParams {
   to: string;
   subject: string;
   text?: string;
   html?: string;
}

let cachedTransporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
   if (cachedTransporter) return cachedTransporter;

   // Support both "service" style (like screenshot) and host/port style.
   const service = process.env.SMTP_SERVICE; // e.g. "Gmail"
   const user = process.env.SMTP_USER || process.env.NODEMAILEREMAIL || "";
   const pass = process.env.SMTP_PASS || process.env.NODEMAILERPASS || "";

   if (service) {
      if (!user || !pass) {
         console.warn(
            "Email not configured: missing SMTP_USER/SMTP_PASS for service " +
               service,
         );
         return null;
      }
      cachedTransporter = nodemailer.createTransport({
         service,
         auth: { user, pass },
      });
      return cachedTransporter;
   }

   const host = process.env.SMTP_HOST;
   const portStr = process.env.SMTP_PORT;
   if (!host || !portStr || !user || !pass) {
      console.warn(
         "Email not configured: set SMTP_SERVICE + SMTP_USER/SMTP_PASS, or SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS.",
      );
      return null;
   }

   const port = Number(portStr);
   const secure = port === 465;
   cachedTransporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
   });
   return cachedTransporter;
}

export async function sendEmail({
   to,
   subject,
   text,
   html,
}: SendEmailParams): Promise<boolean> {
   try {
      const transporter = getTransporter();
      if (!transporter) return false;

      const from = process.env.MAIL_FROM || process.env.SMTP_USER!;
      await transporter.sendMail({ from, to, subject, text, html });
      return true;
   } catch (err) {
      console.error("Error sending email:", err);
      return false;
   }
}

export async function sendRegistrationMagicLink(
   to: string,
   link: string,
   name?: string,
): Promise<boolean> {
   const subject = "Complete your registration";
   const greeting = name ? `Hi ${name},` : "Hi,";
   const text = `${greeting}\n\nClick the link below to verify your email and complete registration.\nThis link will expire soon and can be used once.\n\n${link}`;
   const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color:#202124;">
      <p style="margin:0 0 12px; color:#202124;">${greeting}</p>
      <p style="margin:0 0 12px; color:#202124;">Click the button below to verify your email and complete registration:</p>
      <p style="margin:0 0 16px;">
        <a href="${link}" style="display:inline-block;padding:12px 18px;background:#1976d2;color:#ffffff;text-decoration:none;border-radius:6px;">
          Verify and Sign In
        </a>
      </p>
      <p style="margin:0 0 8px; color:#202124;">If the button doesn't work, copy and paste this link into your browser:</p>
      <p style="margin:0 0 12px;"><a href="${link}" style="color:#1a73e8; text-decoration:underline;">${link}</a></p>
      <p style="margin:0; color:#202124;">This link will expire soon and can be used once.</p>
    </div>
  `;
   return sendEmail({ to, subject, text, html });
}

export async function sendPasswordResetLink(
   to: string,
   link: string,
   name?: string,
): Promise<boolean> {
   const subject = "Reset your password";
   const greeting = name ? `Hi ${name},` : "Hi,";
   const text = `${greeting}\n\nClick the link below to verify your email and reset your password.\nThis link will expire soon and can be used once.\n\n${link}`;
   const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color:#202124;">
      <p style="margin:0 0 12px; color:#202124;">${greeting}</p>
      <p style="margin:0 0 12px; color:#202124;">Click the button below to verify your email and reset your password:</p>
      <p style="margin:0 0 16px;">
        <a href="${link}" style="display:inline-block;padding:12px 18px;background:#1976d2;color:#ffffff;text-decoration:none;border-radius:6px;">
          Verify and Reset Password
        </a>
      </p>
      <p style="margin:0 0 8px; color:#202124;">If the button doesn't work, copy and paste this link into your browser:</p>
      <p style="margin:0 0 12px;"><a href="${link}" style="color:#1a73e8; text-decoration:underline;">${link}</a></p>
      <p style="margin:0; color:#202124;">This link will expire soon and can be used once.</p>
    </div>
  `;
   return sendEmail({ to, subject, text, html });
}
