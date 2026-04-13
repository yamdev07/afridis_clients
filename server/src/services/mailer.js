import nodemailer from 'nodemailer';
import dns from 'dns';

if (typeof dns.setDefaultResultOrder === 'function') {
  dns.setDefaultResultOrder('ipv4first');
}

function getBoolEnv(name, fallback = false) {
  const v = process.env[name];
  if (v === undefined || v === null || v === '') return fallback;
  return String(v).toLowerCase() === 'true' || String(v) === '1';
}

function getNumberEnv(name, fallback) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function isRetriableMailError(error) {
  const message = String(error?.message || '').toLowerCase();
  const code = String(error?.code || '').toLowerCase();
  return [code, message].some((value) =>
    ['etimedout', 'enetunreach', 'econnrefused', 'eai_again', 'connection timeout', 'greeting never received'].some((token) => value.includes(token)),
  );
}

function ipv4Lookup(hostname, options, callback) {
  const dnsOptions = typeof options === 'object' ? options : {};
  dns.lookup(hostname, { ...dnsOptions, family: 4, all: false }, callback);
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function isMailerConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function buildTransporter() {
  if (!isMailerConfigured()) {
    throw new Error('SMTP is not configured (missing SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS)');
  }

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT);
  const secure = getBoolEnv('SMTP_SECURE', false);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    requireTLS: getBoolEnv('SMTP_REQUIRE_TLS', !secure && port === 587),
    connectionTimeout: getNumberEnv('SMTP_CONNECTION_TIMEOUT', 8000),
    greetingTimeout: getNumberEnv('SMTP_GREETING_TIMEOUT', 8000),
    socketTimeout: getNumberEnv('SMTP_SOCKET_TIMEOUT', 12000),
    auth: { user, pass },
    tls: {
      servername: host,
      rejectUnauthorized: true,
    },
    pool: false,
  });
}

async function sendWithFreshTransporter(payload) {
  const transporter = buildTransporter();
  try {
    const info = await transporter.sendMail(payload);
    return { messageId: info.messageId };
  } finally {
    transporter.close();
  }
}

export async function sendMail({ to, subject, text, html }) {
  if (!isMailerConfigured()) return { skipped: true };

  const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;
  const fromName = process.env.SMTP_FROM_NAME || 'ClientFlow';
  const payload = {
    from: `${fromName} <${fromEmail}>`,
    to,
    subject,
    text,
    html,
  };

  const maxAttempts = getNumberEnv('SMTP_MAX_RETRIES', 3);

  let lastError;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await sendWithFreshTransporter(payload);
    } catch (error) {
      lastError = error;
      if (!isRetriableMailError(error) || attempt === maxAttempts) {
        throw error;
      }

      console.warn(`[MAIL] Attempt ${attempt}/${maxAttempts} failed, retrying:`, error?.message || error);
      await wait(700 * attempt);
    }
  }

  throw lastError;
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

