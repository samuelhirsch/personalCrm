import nodemailer from 'nodemailer';

const DEFAULT_PORT = 587;

export function assertSmtpConfigured() {
  const host = process.env.SMTP_HOST?.trim();
  const from = process.env.MAIL_FROM?.trim();
  if (!host || !from) {
    const err = new Error(
      'Email is not configured. Set SMTP_HOST and MAIL_FROM in backend/.env',
    );
    err.code = 'SMTP_NOT_CONFIGURED';
    throw err;
  }
}

function buildTransport() {
  assertSmtpConfigured();
  const host = process.env.SMTP_HOST.trim();
  const port = Number(process.env.SMTP_PORT) || DEFAULT_PORT;
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  const secureExplicit = process.env.SMTP_SECURE;
  const secure =
    secureExplicit === 'true' ||
    secureExplicit === '1' ||
    port === 465;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    ...(user || pass
      ? { auth: { user: user || '', pass: pass || '' } }
      : {}),
  });
}

let cachedTransport;

function getTransport() {
  if (!cachedTransport) cachedTransport = buildTransport();
  return cachedTransport;
};

export async function sendEmail({ to, subject, text }) {
  assertSmtpConfigured();
  const transport = getTransport();
  await transport.sendMail({
    from: process.env.MAIL_FROM.trim(),
    to,
    subject,
    text,
  });
}
