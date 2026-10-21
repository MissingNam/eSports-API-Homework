const crypto = require('crypto');
const service = require('../services/autenticaciones.service');
const asyncHandler = require('../utils/asyncHandler');
const { firmarAccess } = require('../utils/jwt');
const { setAccessCookie, clearAccessCookie } = require('../utils/cookies');

const login = asyncHandler(async (req, res) => {
  const admin = await service.login(req.body);

  const csrfToken = crypto.randomBytes(32).toString('hex');
  setAccessCookie(res, firmarAccess(admin, csrfToken));

  // El JWT viaja en la cookie (HttpOnly); el csrfToken sí lo recibe el frontend
  res.status(200).json({ admin, csrfToken });
});

const logout = asyncHandler(async (req, res) => {
  clearAccessCookie(res);
  res.status(204).send();
});

// El frontend lo llama al cargar la app: confirma la sesión y recupera el csrfToken
const me = asyncHandler(async (req, res) => {
  const admin = await service.perfil(req.admin.id);
  res.status(200).json({ admin, csrfToken: req.csrf });
});

module.exports = { login, logout, me };