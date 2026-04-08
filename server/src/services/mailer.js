import nodemailer from 'nodemailer';
import dns from 'dns';

let cachedTransporter = null;

function getBoolEnv(name, fallback = false) {
  const v = process.env[name];
  if (v === undefined || v === null || v === '') return fallback;
  return String(v).toLowerCase() === 'true' || String(v) === '1';
}

function getNumberEnv(name, fallback) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

export function isMailerConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS);
}

async function resolveSmtpHost(host) {
  try {
    const resolved = await dns.promises.lookup(host, { family: 4 });
    return resolved?.address || host;
  } catch (error) {
    console.warn('[MAIL] IPv4 lookup failed, falling back to hostname:', error?.message || error);
    return host;
  }
}

export async function getTransporter() {
  if (cachedTransporter) return cachedTransporter;

  if (!isMailerConfigured()) {
    throw new Error('SMTP is not configured (missing SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS)');
  }

  const host = process.env.SMTP_HOST;
  const resolvedHost = await resolveSmtpHost(host);
  const port = Number(process.env.SMTP_PORT);
  const secure = getBoolEnv('SMTP_SECURE', false);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  cachedTransporter = nodemailer.createTransport({
    host: resolvedHost,
    port,
    secure,
    requireTLS: getBoolEnv('SMTP_REQUIRE_TLS', false),
    connectionTimeout: getNumberEnv('SMTP_CONNECTION_TIMEOUT', 10000),
    greetingTimeout: getNumberEnv('SMTP_GREETING_TIMEOUT', 10000),
    socketTimeout: getNumberEnv('SMTP_SOCKET_TIMEOUT', 15000),
    auth: { user, pass },
    tls: {
      servername: host,
      family: 4,
    },
  });

  return cachedTransporter;
}

export async function sendMail({ to, subject, text, html }) {
  if (!isMailerConfigured()) return { skipped: true };

  const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;
  const fromName = process.env.SMTP_FROM_NAME || 'ClientFlow';
  const transporter = await getTransporter();

  const info = await transporter.sendMail({
    from: `${fromName} <${fromEmail}>`,
    to,
    subject,
    text,
    html,
  });

  return { messageId: info.messageId };
}

function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export async function sendAccountCreatedEmail({ to, userName, accountEmail, accountPassword, createdByName }) {
  const subject = 'Vos acces ClientFlow';
  const safeName = escapeHtml(userName || '');
  const safeEmail = escapeHtml(accountEmail || to || '');
  const safePassword = escapeHtml(accountPassword || '');
  const safeCreatedBy = escapeHtml(createdByName || 'l\'administrateur');

  const text =
    `Bonjour ${userName || ''},\n\n` +
    `${createdByName || 'L\'administrateur'} vient de creer votre compte ClientFlow.\n\n` +
    `Email: ${accountEmail}\n` +
    `Mot de passe: ${accountPassword}\n\n` +
    `Conseil securite: modifiez votre mot de passe des votre premiere connexion.\n`;

  const html = `
    <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial; background:#0b1220; padding:24px;">
      <div style="max-width:640px; margin:0 auto; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); border-radius:16px; overflow:hidden;">
        <div style="padding:20px 22px; background:linear-gradient(135deg, rgba(99,102,241,0.22), rgba(236,72,153,0.12)); border-bottom:1px solid rgba(255,255,255,0.10);">
          <div style="font-weight:800; letter-spacing:0.12em; text-transform:uppercase; font-size:11px; color:rgba(255,255,255,0.75)">ClientFlow</div>
          <div style="font-size:22px; font-weight:800; color:white; margin-top:6px;">Vos acces viennent d'etre crees</div>
        </div>
        <div style="padding:22px; color:rgba(255,255,255,0.88);">
          <p style="margin:0 0 14px 0; line-height:1.6;">Bonjour <b>${safeName}</b>,</p>
          <p style="margin:0 0 18px 0; line-height:1.6;">${safeCreatedBy} vient de creer votre compte. Voici vos identifiants :</p>
          <div style="background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.10); border-radius:14px; padding:14px 16px; margin:0 0 18px 0;">
            <div style="font-size:12px; opacity:0.9; margin-bottom:6px;">Email</div>
            <div style="font-size:16px; font-weight:800; color:white;">${safeEmail}</div>
            <div style="height:10px;"></div>
            <div style="font-size:12px; opacity:0.9; margin-bottom:6px;">Mot de passe</div>
            <div style="font-size:16px; font-weight:800; color:white; letter-spacing:0.06em;">${safePassword}</div>
          </div>
          <p style="margin:0; line-height:1.6; font-size:12px; opacity:0.85;">
            Conseil securite : changez votre mot de passe des votre premiere connexion.
          </p>
        </div>
      </div>
    </div>
  `.trim();

  return sendMail({ to, subject, text, html });
}

export async function sendNotificationEmail({ to, userName, notification }) {
  const subject = `ClientFlow - ${notification?.title || 'Nouvelle notification'}`;
  const title = escapeHtml(notification?.title || 'Notification');
  const message = escapeHtml(notification?.message || notification?.body || '');
  const safeName = escapeHtml(userName || '');

  const text =
    `Bonjour ${userName || ''},\n\n` +
    `${notification?.title || 'Notification'}\n` +
    `${notification?.message || notification?.body || ''}\n`;

  const html = `
    <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial; background:#0b1220; padding:24px;">
      <div style="max-width:640px; margin:0 auto; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); border-radius:16px; overflow:hidden;">
        <div style="padding:18px 22px; background:linear-gradient(135deg, rgba(34,197,94,0.20), rgba(99,102,241,0.16)); border-bottom:1px solid rgba(255,255,255,0.10);">
          <div style="font-weight:800; letter-spacing:0.12em; text-transform:uppercase; font-size:11px; color:rgba(255,255,255,0.75)">ClientFlow</div>
          <div style="font-size:20px; font-weight:800; color:white; margin-top:6px;">Nouvelle notification</div>
        </div>
        <div style="padding:22px; color:rgba(255,255,255,0.88);">
          <p style="margin:0 0 14px 0; line-height:1.6;">Bonjour <b>${safeName}</b>,</p>
          <div style="background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.10); border-radius:14px; padding:14px 16px;">
            <div style="font-size:13px; opacity:0.85; margin-bottom:6px;">${title}</div>
            <div style="font-size:15px; font-weight:700; color:white; line-height:1.55;">${message}</div>
          </div>
          <p style="margin:16px 0 0 0; line-height:1.6; font-size:12px; opacity:0.7;">
            Cet email est envoye automatiquement suite a une action ou un evenement dans ClientFlow.
          </p>
        </div>
      </div>
    </div>
  `.trim();

  return sendMail({ to, subject, text, html });
}
