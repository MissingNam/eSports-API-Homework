// const crypto = require('crypto');
// const { HttpError } = require('../utils/errors');
// const { verificarAccess } = require('../utils/jwt');
// const { COOKIE_ACCESS } = require('../utils/cookies');

import crypto from 'crypto';
import { HttpError } from '../utils/errors.js';
import { verificarAccess } from '../utils/jwt.js';
import { COOKIE_ACCESS } from '../utils/cookies.js';

// Autenticación: ¿hay una cookie con un JWT válido?
function requireAuth(req, res, next) {
  const token = req.cookies && req.cookies[COOKIE_ACCESS];
  if (!token) return next(new HttpError(401, 'Autenticación requerida'));

  try {
    const payload = verificarAccess(token);
    req.admin = { id: payload.sub, username: payload.username };
    req.csrf = payload.csrf;
    next();
  } catch (err) {
    next(new HttpError(401, 'Sesión inválida o expirada'));
  }
}

// Anti-CSRF: el header debe coincidir con el valor guardado dentro del JWT
function requireCsrf(req, res, next) {
  const enviado = req.get('X-CSRF-Token');
  if (!enviado || !req.csrf) return next(new HttpError(403, 'Token CSRF requerido'));

  const a = Buffer.from(enviado);
  const b = Buffer.from(req.csrf);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return next(new HttpError(403, 'Token CSRF inválido'));
  }
  next();
}

// Para POST, PUT y DELETE: autenticado + CSRF (el orden importa)
const protegerEscritura = [requireAuth, requireCsrf];

export { requireAuth, requireCsrf, protegerEscritura };