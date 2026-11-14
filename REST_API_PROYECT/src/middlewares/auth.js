import crypto from 'crypto';
import { HttpError } from '../utils/errors.js';
import { verificarAccess } from '../utils/jwt.js';
import { COOKIE_ACCESS } from '../utils/cookies.js';

// Autenticación: ¿hay una cookie con un JWT válido? (admin o usuario)
function requireAuth(req, res, next) {
  const token = req.cookies && req.cookies[COOKIE_ACCESS];
  if (!token) return next(new HttpError(401, 'Autenticación requerida'));

  try {
    const payload = verificarAccess(token);
    req.sesion = { id: payload.sub, nombre: payload.nombre, rol: payload.rol };
    req.csrf = payload.csrf;
    next();
  } catch (err) {
    next(new HttpError(401, 'Sesión inválida o expirada'));
  }
}

// Autorización: solo los administradores pueden modificar datos
function requireAdmin(req, res, next) {
  if (!req.sesion || req.sesion.rol !== 'admin') {
    return next(new HttpError(403, 'Se requieren permisos de administrador'));
  }
  next();
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

// Para POST, PUT y DELETE: autenticado + administrador + CSRF (el orden importa)
const protegerEscritura = [requireAuth, requireAdmin, requireCsrf];

export { requireAuth, requireAdmin, requireCsrf, protegerEscritura };