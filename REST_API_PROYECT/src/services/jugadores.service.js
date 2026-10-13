const { Op } = require('sequelize');
const { HttpError } = require('../utils/errors');
const { Jugador, Roster, RosterJugador } = require('../../models');

const CAMPOS = ['nickname', 'nombre_real', 'pais', 'rol', 'estado'];

// Solo dejamos pasar los campos permitidos (ignora "id" u otros que manden)
function filtrarCampos(body = {}) {
  const datos = {};
  CAMPOS.forEach((c) => {
    if (body[c] !== undefined) datos[c] = body[c];
  });
  return datos;
}

async function listar({ rol, estado, search } = {}) {
  const where = {};
  if (rol) where.rol = rol;
  if (estado) where.estado = estado;
  if (search) where.nickname = { [Op.like]: `%${search}%` };

  return Jugador.findAll({ where, order: [['nickname', 'ASC']] });
}

async function obtener(id) {
  const n = Number(id);
  if (!Number.isInteger(n) || n < 1) {
    throw new HttpError(400, 'El id debe ser un entero positivo');
  }
  const jugador = await Jugador.findByPk(n);
  if (!jugador) throw new HttpError(404, 'Jugador no encontrado');
  return jugador;
}

async function crear(body) {
  return Jugador.create(filtrarCampos(body));
}

// AQUI ESTA SU VALIDACION DE CAMBIO DE ROL
async function validarCambioDeRol(jugador, nuevoRol) {
  const comoTitular = await RosterJugador.findAll({
    where: { id_jugador: jugador.id, rol_en_roster: 'Titular' },
    attributes: ['id_roster']
  });
  if (comoTitular.length === 0) return;

  const otrosTitulares = await RosterJugador.findAll({
    where: {
      id_roster: comoTitular.map((f) => f.id_roster),
      rol_en_roster: 'Titular',
      id_jugador: { [Op.ne]: jugador.id }
    },
    attributes: ['id_roster', 'id_jugador']
  });
  if (otrosTitulares.length === 0) return;


  const coincidentes = await Jugador.findAll({
    where: { id: otrosTitulares.map((o) => o.id_jugador), rol: nuevoRol },
    attributes: ['id', 'nickname']
  });
  if (coincidentes.length === 0) return;

  const choque = otrosTitulares.find((o) =>
    coincidentes.some((c) => c.id === o.id_jugador)
  );
  const roster = await Roster.findByPk(choque.id_roster);
  const otro = coincidentes.find((c) => c.id === choque.id_jugador);

  throw new HttpError(
    409,
    `No se puede cambiar el rol a ${nuevoRol}: ${jugador.nickname} es titular en ` +
    `el roster "${roster.nombre}", donde ${otro.nickname} ya es titular ${nuevoRol}`
  );
}

async function actualizar(id, body) {
  const jugador = await obtener(id);
  const datos = filtrarCampos(body);

  if (datos.rol !== undefined && datos.rol !== jugador.rol) {
    await validarCambioDeRol(jugador, datos.rol);
  }

  return jugador.update(datos);
}

async function eliminar(id) {
  const jugador = await obtener(id);
  await jugador.destroy();
}

module.exports = { listar, obtener, crear, actualizar, eliminar };