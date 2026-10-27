// const jwt = require('jsonwebtoken');

import jwt from 'jsonwebtoken';

function secreto() {
  const s = process.env.JWT_SECRET;
  if (!s || s.length < 32) {
    throw new Error('JWT_SECRET falta o tiene menos de 32 caracteres en el .env');
  }
  return s;
}

secreto(); 

const EXPIRA_SEG = Number(process.env.JWT_ACCESS_EXPIRES_SECONDS) || 8 * 60 * 60;

function firmarAccess(admin, csrf) {
  return jwt.sign(
    { sub: admin.id, username: admin.username, type: 'access', csrf },
    secreto(),
    { algorithm: 'HS256', expiresIn: EXPIRA_SEG }
  );
}

// Lanza si el token es inválido, expiró o no es de tipo "access"
function verificarAccess(token) {
  const payload = jwt.verify(token, secreto(), { algorithms: ['HS256'] });
  if (payload.type !== 'access') throw new Error('Tipo de token inválido');
  return payload;
}

export {firmarAccess, verificarAccess, EXPIRA_SEG };