// const crypto = require('crypto');
// const service = require('../services/autenticaciones.service');
// const asyncHandler = require('../utils/asyncHandler');
// const { firmarAccess } = require('../utils/jwt');
// const { setAccessCookie, clearAccessCookie } = require('../utils/cookies');

import crypto from 'crypto';
import * as service from '../services/autenticaciones.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import { firmarAccess } from '../utils/jwt.js';
import usuariosService from '../services/usuarios.service.js';
import google from '../services/google.service.js'

import {
  COOKIE_STATE,
  setAccessCookie,
  clearAccessCookie,
  setStateCookie,
  clearStateCookie
} from '../utils/cookies.js';

const nuevoCsrf = () => crypto.randomBytes(32).toString('hex');

// ---------- Administrador (usuario + contraseña) ----------
const login = asyncHandler(async (req, res) => {
  const admin = await service.login(req.body);

  const csrfToken = nuevoCsrf();
  setAccessCookie(res, firmarAccess({ id: admin.id, nombre: admin.username, rol: 'admin' }, csrfToken));

  // El JWT viaja en la cookie (HttpOnly); el csrfToken sí lo recibe el frontend
  res.status(200).json({ admin, csrfToken });
});

const logout = asyncHandler(async (req, res) => {
  clearAccessCookie(res);
  res.status(204).send();
});

// El frontend lo llama al cargar la app: confirma la sesión y recupera el csrfToken
const me = asyncHandler(async (req, res) => {
  const datos = await service.perfil(req.sesion);
  res.status(200).json({ ...datos, csrfToken: req.csrf });
});

// ---------- Google OAuth ----------
// Paso 1: el navegador llega aquí y lo mandamos a Google
const googleLogin = asyncHandler(async (req, res) => {
  const state = crypto.randomBytes(16).toString('hex');
  setStateCookie(res, state);
  res.redirect(google.urlDeLogin(state));
});

// Paso 2: Google devuelve al navegador aquí con ?code=...&state=...
// Es una navegación del navegador (no una llamada fetch), así que siempre respondemos con redirect
const googleCallback = async (req, res) => {
  const volver = (ruta) => res.redirect(process.env.FRONTEND_ORIGIN + ruta);

  const { code, state, error } = req.query;
  const esperado = req.cookies && req.cookies[COOKIE_STATE];
  clearStateCookie(res);

  // Canceló en Google (error), o el state no coincide (la petición no salió de nuestro login)
  if (error || !code || !state || state !== esperado) {
    return volver('/login?error=google');
  }

  try {
    const perfil = await google.perfilDesdeCodigo(code);
    const usuario = await usuariosService.registrarDesdeGoogle(perfil);

    setAccessCookie(
      res,
      firmarAccess({ id: usuario.id, nombre: usuario.nombre, rol: 'usuario' }, nuevoCsrf())
    );
    volver('/');
  } catch (err) {
    console.error('Error en el login con Google:', err.message);
    volver('/login?error=google');
  }
};

export { login, logout, me, googleLogin, googleCallback };