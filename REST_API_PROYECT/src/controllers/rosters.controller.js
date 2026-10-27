// const service = require('../services/rosters.service');
// const asyncHandler = require('../utils/asyncHandler');

import * as service from '../services/rosters.service.js'
import asyncHandler from '../utils/asyncHandler.js';

const listar = asyncHandler(async (req, res) => {
  res.status(200).json(await service.listar(req.query));
});

const obtener = asyncHandler(async (req, res) => {
  res.status(200).json(await service.obtenerDetalle(req.params.id));
});

const crear = asyncHandler(async (req, res) => {
  res.status(201).json(await service.crear(req.body));
});

const actualizar = asyncHandler(async (req, res) => {
  res.status(200).json(await service.actualizar(req.params.id, req.body));
});

const eliminar = asyncHandler(async (req, res) => {
  await service.eliminar(req.params.id);
  res.status(204).send();
});

export { listar, obtener, crear, actualizar, eliminar };