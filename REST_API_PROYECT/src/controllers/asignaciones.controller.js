// const service = require('../services/asignaciones.service');
// const asyncHandler = require('../utils/asyncHandler');

import * as service from '../services/asignaciones.service.js';
import asyncHandler from '../utils/asyncHandler.js';

const listar = asyncHandler(async (req, res) => {
  res.status(200).json(await service.listar(req.params.id));
});

const asignar = asyncHandler(async (req, res) => {
  res.status(201).json(await service.asignar(req.params.id, req.body));
});

const cambiarRol = asyncHandler(async (req, res) => {
  res.status(200).json(
    await service.cambiarRol(req.params.id, req.params.id_jugador, req.body)
  );
});

const quitar = asyncHandler(async (req, res) => {
  await service.quitar(req.params.id, req.params.id_jugador);
  res.status(204).send();
});

export { listar, asignar, cambiarRol, quitar };