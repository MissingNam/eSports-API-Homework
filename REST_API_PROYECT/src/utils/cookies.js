// const { EXPIRA_SEG } = require('./jwt');
// const COOKIE_ACCESS = 'access_token';

import { EXPIRA_SEG } from './jwt.js';

const COOKIE_ACCESS = 'access_token';


function opciones() {
  return {
    httpOnly: true,                                   // JS del navegador no puede leerla (anti-XSS)
    sameSite: 'strict',                               // no se envía desde otros sitios (anti-CSRF)
    secure: process.env.NODE_ENV === 'production',    // solo HTTPS en producción
    path: '/'
  };
}

function setAccessCookie(res, token) {
  res.cookie(COOKIE_ACCESS, token, { ...opciones(), maxAge: EXPIRA_SEG * 1000 });
}

function clearAccessCookie(res) {
  res.clearCookie(COOKIE_ACCESS, opciones());   // debe usar las mismas opciones con las que se creó
}

export { COOKIE_ACCESS, setAccessCookie, clearAccessCookie };