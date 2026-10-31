// const bcrypt = require('bcryptjs');
// const { HttpError } = require('../utils/errors');
// const { Admin } = require('../../models/index.js');

import bcrypt from 'bcryptjs';
import { HttpError } from '../utils/errors.js';
import { Admin, Usuario } from '../../models/index.js';

// Login de administrador (usuario + contraseña)
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

// Confirma que quien tiene la sesión todavía existe en la BD.
// sesion = { id, rol }; el rol indica en qué tabla buscar.
async function perfil(sesion) {
  if (sesion.rol === 'admin') {
    const admin = await Admin.findByPk(sesion.id);
    if (!admin) throw new HttpError(401, 'Sesión inválida o expirada');
    return { rol: 'admin', admin: { id: admin.id, username: admin.username } };
  }

  const usuario = await Usuario.findByPk(sesion.id);
  if (!usuario) throw new HttpError(401, 'Sesión inválida o expirada');
  return {
    rol: 'usuario',
    usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, foto: usuario.foto }
  };
}

export { login, perfil };