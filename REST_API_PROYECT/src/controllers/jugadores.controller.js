// const service = require('../services/jugadores.service');
// const asyncHandler = require('../utils/asyncHandler');

import * as service from '../services/jugadores.service.js'
import asyncHandler from '../utils/asyncHandler.js';

const listar = asyncHandler(async (req, res) => {
  const jugadores = await service.listar(req.query);
  res.status(200).json(jugadores);
});

const obtener = asyncHandler(async (req, res) => {
  const jugador = await service.obtener(req.params.id);
  res.status(200).json(jugador);
});

const crear = asyncHandler(async (req, res) => {
  const jugador = await service.crear(req.body);
  res.status(201).json(jugador);
});

const actualizar = asyncHandler(async (req, res) => {
  const jugador = await service.actualizar(req.params.id, req.body);
  res.status(200).json(jugador);
});

const eliminar = asyncHandler(async (req, res) => {
  await service.eliminar(req.params.id);
  res.status(204).send();
});

export { listar, obtener, crear, actualizar, eliminar };