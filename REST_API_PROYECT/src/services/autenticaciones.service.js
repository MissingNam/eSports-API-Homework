// const bcrypt = require('bcryptjs');
// const { HttpError } = require('../utils/errors');
// const { Admin } = require('../../models/index.js');

import bcrypt from 'bcryptjs';
import { HttpError } from '../utils/errors.js';
import { Admin, Usuario } from '../../models/index.js';

// Login de administrador (usuario + contraseña)
async function login(body = {}) {
  const { username, password } = body

  if (typeof username !== 'string' || typeof password !== 'string' || !username.trim() || !password) {
    throw new HttpError(400, 'Usuario y contraseña son obligatorios')
  }

  // 1) ¿es un administrador? (por nombre de usuario)
  const admin = await Admin.findOne({ where: { username: username.trim() } })
  if (admin) {
    if (!(await bcrypt.compare(password, admin.password_hash))) {
      throw new HttpError(401, 'Credenciales inválidas')
    }
    return {
      id: admin.id,
      nombre: admin.username,
      rol: 'admin',
      perfil: { admin: { id: admin.id, username: admin.username } }
    }
  }

  // 2) si no, ¿es un usuario registrado? (por correo; las cuentas solo de Google no tienen contraseña)
  const usuario = await Usuario.findOne({ where: { email: username.trim().toLowerCase() } })
  if (!usuario || !usuario.password_hash || !(await bcrypt.compare(password, usuario.password_hash))) {
    throw new HttpError(401, 'Credenciales inválidas')
  }

  await usuario.update({ ultimo_acceso: new Date() })
  return {
    id: usuario.id,
    nombre: usuario.nombre,
    rol: 'usuario',
    perfil: { usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, foto: usuario.foto } }
  }
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