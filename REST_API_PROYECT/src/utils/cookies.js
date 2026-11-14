import { EXPIRA_SEG } from './jwt.js';

const COOKIE_ACCESS = 'access_token';
const COOKIE_STATE = 'oauth_state';

// Lax (no Strict): al volver de Google el navegador llega desde otro sitio, y con Strict
// podría descartar la cookie. Las escrituras siguen protegidas por el token CSRF, y Lax
// tampoco envía la cookie en POST/PUT/DELETE que vengan de otros sitios.
function opciones() {
  return {
    httpOnly: true,                                   // JS del navegador no puede leerla (anti-XSS)
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/'
  };
}

function setAccessCookie(res, token) {
  res.cookie(COOKIE_ACCESS, token, { ...opciones(), maxAge: EXPIRA_SEG * 1000 });
}

function clearAccessCookie(res) {
  res.clearCookie(COOKIE_ACCESS, opciones());   // mismas opciones con las que se creó
}

// Cookie temporal (10 min) que guarda el "state" del login con Google
function setStateCookie(res, state) {
  res.cookie(COOKIE_STATE, state, { ...opciones(), maxAge: 10 * 60 * 1000 });
}

function clearStateCookie(res) {
  res.clearCookie(COOKIE_STATE, opciones());
}

export {
  COOKIE_ACCESS,
  COOKIE_STATE,
  setAccessCookie,
  clearAccessCookie,
  setStateCookie,
  clearStateCookie
};