const { Roster, sequelize } = require('../../models');
const { HttpError } = require('../utils/errors');

const CAMPOS = ['nombre', 'juego', 'tipo', 'temporada'];

function filtrarCampos(body = {}) {
  const datos = {};
  CAMPOS.forEach((c) => {
    if (body[c] !== undefined) datos[c] = body[c];
  });
  return datos;
}

function validarId(id) {
  const n = Number(id);
  if (!Number.isInteger(n) || n < 1) {
    throw new HttpError(400, 'El id debe ser un entero positivo');
  }
  return n;
}

// Convierte el resultado de Sequelize al formato del documento:
// { ..., jugadores: [{ id, nickname, rol, rol_en_roster }] }
function formatearDetalle(roster) {
  const data = roster.toJSON();
  data.jugadores = data.jugadores.map((j) => ({
    id: j.id,
    nickname: j.nickname,
    rol: j.rol,
    rol_en_roster: j.RosterJugador.rol_en_roster
  }));
  return data;
}

async function listar({ tipo, temporada } = {}) {
  const where = {};
  if (tipo) where.tipo = tipo;
  if (temporada) where.temporada = temporada;

  return Roster.findAll({
    where,
    attributes: {
      include: [[
        sequelize.literal(
          '(SELECT COUNT(*) FROM roster_jugadores AS rj WHERE rj.id_roster = Roster.id)'
        ),
        'cantidad_jugadores'
      ]]
    },
    order: [['id', 'ASC']]
  });
}

// Devuelve el modelo "simple" (sin jugadores), para editar/eliminar
async function obtenerSimple(id) {
  const roster = await Roster.findByPk(validarId(id));
  if (!roster) throw new HttpError(404, 'Roster no encontrado');
  return roster;
}

async function obtenerDetalle(id) {
  const roster = await Roster.findByPk(validarId(id), {
    include: {
      association: 'jugadores',
      attributes: ['id', 'nickname', 'rol'],
      through: { attributes: ['rol_en_roster'] }
    }
  });
  if (!roster) throw new HttpError(404, 'Roster no encontrado');
  return formatearDetalle(roster);
}

async function crear(body) {
  return Roster.create(filtrarCampos(body));
}

async function actualizar(id, body) {
  const roster = await obtenerSimple(id);
  return roster.update(filtrarCampos(body));
}

async function eliminar(id) {
  const roster = await obtenerSimple(id);
  await roster.destroy();
}

module.exports = { listar, obtenerDetalle, obtenerSimple, crear, actualizar, eliminar };