// const { Op } = require('sequelize');
// const { HttpError } = require('../utils/errors');S
// const { Jugador, Roster, RosterJugador } = require('../../models/index.js');

import { Op } from 'sequelize';
import { HttpError } from '../utils/errors.js';
import { Jugador } from '../../models/index.js';

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

// RN-03 al cambiar el rol de un jugador que ya es titular en algún roster
async function validarCambioDeRol(jugador, nuevoRol) {
  // Rosters donde este jugador es titular
  const rosters = await jugador.getRosters({
    attributes: ['id'],
    through: { where: { rol_en_roster: 'Titular' }, attributes: [] }
  });
  if (rosters.length === 0) return;

  // Otros jugadores con el nuevo rol que sean titulares en alguno de esos rosters
  const coincidentes = await Jugador.findAll({
    where: { rol: nuevoRol, id: { [Op.ne]: jugador.id } },
    attributes: ['id', 'nickname'],
    include: {
      association: 'rosters',
      attributes: ['id', 'nombre'],
      where: { id: rosters.map((r) => r.id) },
      through: { where: { rol_en_roster: 'Titular' }, attributes: [] }
    }
  });
  if (coincidentes.length === 0) return;

  const otro = coincidentes[0];
  const roster = otro.rosters[0];

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

export { listar, obtener, crear, actualizar, eliminar };