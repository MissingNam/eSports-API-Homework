import bcrypt from 'bcryptjs'
import { HttpError } from '../utils/errors.js'
import { Usuario } from '../../models/index.js'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Registro con correo y contraseña (sin Google)
async function registrarLocal(body = {}) {
  const nombre = String(body.nombre ?? '').trim()
  const email = String(body.email ?? '').trim().toLowerCase()
  const password = String(body.password ?? '')

  if (!nombre || nombre.length > 100) {
    throw new HttpError(400, 'El nombre es obligatorio (máximo 100 caracteres)')
  }
  if (!EMAIL.test(email) || email.length > 255) {
    throw new HttpError(400, 'El correo no es válido')
  }
  if (password.length < 8 || password.length > 72) {
    throw new HttpError(400, 'La contraseña debe tener entre 8 y 72 caracteres')
  }

  if (await Usuario.findOne({ where: { email } })) {
    throw new HttpError(409, 'Ya existe una cuenta con ese correo')
  }

  try {
    return await Usuario.create({
      email,
      nombre,
      google_id: null,
      password_hash: await bcrypt.hash(password, 10),
      ultimo_acceso: new Date()
    })
  } catch (e) {
    if (e.name === 'SequelizeUniqueConstraintError') {
      throw new HttpError(409, 'Ya existe una cuenta con ese correo')
    }
    throw e
  }
}

// Login con Google: busca por google_id, si no por correo (cuenta local), y si no la crea
async function registrarDesdeGoogle(perfil) {
  const email = perfil.email.toLowerCase()
  const datos = { email, nombre: perfil.nombre, foto: perfil.foto, ultimo_acceso: new Date() }

  let usuario = await Usuario.findOne({ where: { google_id: perfil.google_id } })
  if (!usuario) usuario = await Usuario.findOne({ where: { email } })

  if (!usuario) return Usuario.create({ ...datos, google_id: perfil.google_id })

  await usuario.update({ ...datos, google_id: perfil.google_id })
  return usuario
}

export default {registrarLocal, registrarDesdeGoogle}