import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const ROOT_DIR = process.cwd();
const DATA_DIR = path.join(ROOT_DIR, 'data');
const AUTH_FILE = path.join(DATA_DIR, 'admin-auth.json');
const SESSIONS_FILE = path.join(DATA_DIR, 'admin-sessions.json');

const SESSION_COOKIE = 'raykels_admin_session';
const SESSION_TTL_MS = 1000 * 60 * 60 * 8;

const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const MAX_LOGIN_ATTEMPTS = 10;

const loginAttempts = new Map();

function ensureFile(file, fallback) {
  if (!fs.existsSync(file)) {
    fs.writeFileSync(
      file,
      JSON.stringify(fallback, null, 2),
      'utf8'
    );
  }
}

function readJson(file, fallback) {
  ensureFile(file, fallback);

  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

function writeJson(file, data) {
  fs.writeFileSync(
    file,
    JSON.stringify(data, null, 2),
    'utf8'
  );
}

function hashPassword(password, salt) {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

export function createPasswordHash(password) {
  const salt = crypto.randomBytes(32).toString('hex');

  return {
    algorithm: 'scrypt',
    salt,
    hash: hashPassword(password, salt)
  };
}

export function verifyPassword(password, stored) {
  if (
    !stored ||
    stored.algorithm !== 'scrypt' ||
    !stored.salt ||
    !stored.hash
  ) {
    return false;
  }

  const calculated = Buffer.from(
    hashPassword(password, stored.salt),
    'hex'
  );

  const expected = Buffer.from(stored.hash, 'hex');

  if (calculated.length !== expected.length) {
    return false;
  }

  return crypto.timingSafeEqual(calculated, expected);
}

export function getAdminCredentials() {
  return readJson(AUTH_FILE, null);
}

export function saveAdminCredentials(credentials) {
  writeJson(AUTH_FILE, credentials);
}

function getSessions() {
  return readJson(SESSIONS_FILE, { sessions: [] });
}

function saveSessions(data) {
  writeJson(SESSIONS_FILE, data);
}

function cleanupSessions(data) {
  const now = Date.now();

  data.sessions = data.sessions.filter(
    session => session.expiresAt > now
  );

  return data;
}

function getClientKey(req) {
  return (
    req.ip ||
    req.socket?.remoteAddress ||
    'unknown'
  );
}

function getSessionToken(req) {
  const cookieHeader = req.headers?.cookie || '';

  const cookies = cookieHeader
    .split(';')
    .map(part => part.trim())
    .filter(Boolean);

  const sessionCookie = cookies.find(
    part => part.startsWith(`${SESSION_COOKIE}=`)
  );

  if (!sessionCookie) {
    return null;
  }

  return decodeURIComponent(
    sessionCookie.slice(`${SESSION_COOKIE}=`.length)
  );
}

export function isLoginRateLimited(req) {
  const key = getClientKey(req);
  const record = loginAttempts.get(key);

  if (!record) {
    return false;
  }

  if (Date.now() - record.windowStart >= LOGIN_WINDOW_MS) {
    loginAttempts.delete(key);
    return false;
  }

  return record.attempts >= MAX_LOGIN_ATTEMPTS;
}

export function recordFailedLogin(req) {
  const key = getClientKey(req);
  const now = Date.now();

  const record = loginAttempts.get(key);

  if (!record || now - record.windowStart >= LOGIN_WINDOW_MS) {
    loginAttempts.set(key, {
      attempts: 1,
      windowStart: now
    });
    return;
  }

  record.attempts += 1;
}

export function clearLoginAttempts(req) {
  loginAttempts.delete(getClientKey(req));
}

export function createAdminSession(req) {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto
    .createHash('sha256')
    .update(rawToken)
    .digest('hex');

  const now = Date.now();

  let data = cleanupSessions(getSessions());

  data.sessions.push({
    id: tokenHash,
    createdAt: now,
    expiresAt: now + SESSION_TTL_MS,
    ip: req.ip || req.socket?.remoteAddress || null,
    userAgent: req.get('user-agent') || null
  });

  saveSessions(data);

  return {
    token: rawToken,
    expiresAt: now + SESSION_TTL_MS
  };
}

export function getSession(req) {
  const token = getSessionToken(req);

  if (!token) {
    return null;
  }

  const tokenHash = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  let data = cleanupSessions(getSessions());

  const session = data.sessions.find(
    entry => entry.id === tokenHash
  );

  saveSessions(data);

  return session || null;
}

export function destroyAdminSession(req) {
  const token = getSessionToken(req);

  if (!token) {
    return;
  }

  const tokenHash = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  const data = cleanupSessions(getSessions());

  data.sessions = data.sessions.filter(
    entry => entry.id !== tokenHash
  );

  saveSessions(data);
}

export function getSessionCookieName() {
  return SESSION_COOKIE;
}

export function getSessionTtl() {
  return SESSION_TTL_MS;
}

export function requireAdmin(req, res, next) {
  const session = getSession(req);

  if (!session) {
    return res.status(401).json({
      error: 'Administrator authentication required.'
    });
  }

  req.adminSession = session;
  next();
}
