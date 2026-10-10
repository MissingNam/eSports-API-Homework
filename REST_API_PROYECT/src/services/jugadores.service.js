const { Op } = require('sequelize');
const { Jugador } = require('../../models');
const { HttpError } = require('../utils/errors');

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

async function actualizar(id, body) {
  const jugador = await obtener(id);
  return jugador.update(filtrarCampos(body));
}

async function eliminar(id) {
  const jugador = await obtener(id);
  await jugador.destroy();
}

module.exports = { listar, obtener, crear, actualizar, eliminar };