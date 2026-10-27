// const bcrypt = require('bcryptjs');
// const { HttpError } = require('../utils/errors');
// const { Admin } = require('../../models/index.js');

import bcrypt from 'bcryptjs';
import { HttpError } from '../utils/errors.js';
import { Admin } from '../../models/index.js';

async function login(body = {}) {
  const { username, password } = body;

  if (!username || !password) {
    throw new HttpError(400, 'Usuario y contraseña son obligatorios');
  }

  const admin = await Admin.findOne({ where: { username } });

  if (!admin || !(await bcrypt.compare(password, admin.password_hash))) {
    throw new HttpError(401, 'Credenciales inválidas');
  }

  return { id: admin.id, username: admin.username };
}

// Confirma que el admin del token todavía existe en la BD
async function perfil(id) {
  const admin = await Admin.findByPk(id);
  if (!admin) throw new HttpError(401, 'Sesión inválida o expirada');
  return { id: admin.id, username: admin.username };
}

export { login, perfil };