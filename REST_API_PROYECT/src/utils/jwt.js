
import jwt from 'jsonwebtoken'

function secreto() {
  const s = process.env.JWT_SECRET;
  if (!s || s.length < 32) {
    throw new Error('JWT_SECRET falta o tiene menos de 32 caracteres en el .env');
  }
  return s;
}

secreto(); // falla al arrancar el servidor, no en el primer login

const EXPIRA_SEG = Number(process.env.JWT_ACCESS_EXPIRES_SECONDS) || 8 * 60 * 60;

const ROLES = ['admin', 'usuario'];

// sujeto = { id, nombre, rol }   (rol: 'admin' o 'usuario')
function firmarAccess(sujeto, csrf) {
  return jwt.sign(
    { sub: sujeto.id, nombre: sujeto.nombre, rol: sujeto.rol, type: 'access', csrf },
    secreto(),
    { algorithm: 'HS256', expiresIn: EXPIRA_SEG }
  );
}

// Lanza si el token es inválido, expiró, no es "access" o no trae un rol válido
function verificarAccess(token) {
  const payload = jwt.verify(token, secreto(), { algorithms: ['HS256'] });
  if (payload.type !== 'access' || !ROLES.includes(payload.rol)) {
    throw new Error('Token inválido');
  }
  return payload;
}

export { firmarAccess, verificarAccess, EXPIRA_SEG };