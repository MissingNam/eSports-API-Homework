import { Usuario } from '../../models/index.js'
//const { Usuario } = db

// Si el google_id ya existe, actualiza sus datos; si no, lo registra
async function registrarDesdeGoogle(perfil) {
  const datos = {
    email: perfil.email,
    nombre: perfil.nombre,
    foto: perfil.foto,
    ultimo_acceso: new Date()
  };

  const [usuario, creado] = await Usuario.findOrCreate({
    where: { google_id: perfil.google_id },
    defaults: datos
  });

  if (!creado) await usuario.update(datos);
  return usuario;
}

export default { registrarDesdeGoogle };