const { Op } = require('sequelize');
const { Jugador, RosterJugador } = require('../../models');
const { HttpError } = require('../utils/errors');
const rostersService = require('./rosters.service');
const jugadoresService = require('./jugadores.service');

const ROLES_EN_ROSTER = ['Titular', 'Suplente'];
const MAX_TITULARES = 5;

function validarRolEnRoster(valor) {
  if (!ROLES_EN_ROSTER.includes(valor)) {
    throw new HttpError(400, 'rol_en_roster debe ser Titular o Suplente');
  }
}

// RN-03 y RN-02: se revisan antes de dejar a alguien como titular.
// "excluirIdJugador" sirve en el PUT: el propio jugador no cuenta contra sí mismo.
async function validarTitular(idRoster, jugador, excluirIdJugador = null) {
  const where = { id_roster: idRoster, rol_en_roster: 'Titular' };
  if (excluirIdJugador) where.id_jugador = { [Op.ne]: excluirIdJugador };

  const filas = await RosterJugador.findAll({ where, attributes: ['id_jugador'] });
  const titulares = filas.length
    ? await Jugador.findAll({
        where: { id: filas.map((f) => f.id_jugador) },
        attributes: ['id', 'nickname', 'rol']
      })
    : [];

  // RN-03: no dos titulares con el mismo rol
  const repetido = titulares.find((t) => t.rol === jugador.rol);
  if (repetido) {
    throw new HttpError(
      409,
      `Ya hay un titular con el rol ${jugador.rol} en este roster (${repetido.nickname})`
    );
  }

  // RN-02: máximo 5 titulares
  if (titulares.length >= MAX_TITULARES) {
    throw new HttpError(409, 'El roster ya tiene 5 titulares');
  }
}

async function buscarAsignacion(idRoster, idJugador) {
  const asignacion = await RosterJugador.findOne({
    where: { id_roster: idRoster, id_jugador: idJugador }
  });
  if (!asignacion) throw new HttpError(404, 'El jugador no está asignado a este roster');
  return asignacion;
}

async function listar(idRoster) {
  const detalle = await rostersService.obtenerDetalle(idRoster); // lanza 400/404
  return detalle.jugadores;
}

async function asignar(idRoster, body = {}) {
  const roster = await rostersService.obtenerSimple(idRoster);        // 404 roster

  if (body.id_jugador === undefined) {
    throw new HttpError(400, 'id_jugador es obligatorio');
  }
  validarRolEnRoster(body.rol_en_roster);                             // 400

  const jugador = await jugadoresService.obtener(body.id_jugador);    // 404 jugador

  const yaAsignado = await RosterJugador.findOne({
    where: { id_roster: roster.id, id_jugador: jugador.id }
  });
  if (yaAsignado) throw new HttpError(409, 'El jugador ya está en este roster');

  if (body.rol_en_roster === 'Titular') {
    await validarTitular(roster.id, jugador);                         // 409
  }

  await RosterJugador.create({
    id_roster: roster.id,
    id_jugador: jugador.id,
    rol_en_roster: body.rol_en_roster
  });

  return {
    id: jugador.id,
    nickname: jugador.nickname,
    rol: jugador.rol,
    rol_en_roster: body.rol_en_roster
  };
}

async function cambiarRol(idRoster, idJugador, body = {}) {
  const roster = await rostersService.obtenerSimple(idRoster);
  const jugador = await jugadoresService.obtener(idJugador);
  validarRolEnRoster(body.rol_en_roster);
  const asignacion = await buscarAsignacion(roster.id, jugador.id);

  if (body.rol_en_roster === 'Titular') {
    await validarTitular(roster.id, jugador, jugador.id);
  }

  await asignacion.update({ rol_en_roster: body.rol_en_roster });

  return {
    id: jugador.id,
    nickname: jugador.nickname,
    rol: jugador.rol,
    rol_en_roster: asignacion.rol_en_roster
  };
}

async function quitar(idRoster, idJugador) {
  const roster = await rostersService.obtenerSimple(idRoster);
  const jugador = await jugadoresService.obtener(idJugador);
  const asignacion = await buscarAsignacion(roster.id, jugador.id);
  await asignacion.destroy();
}

module.exports = { listar, asignar, cambiarRol, quitar };