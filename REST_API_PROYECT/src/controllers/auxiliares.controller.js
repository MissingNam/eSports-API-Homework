// const { ROLES, ESTADOS, TIPOS_ROSTER } = require('../utils/constantes');
// const { sequelize } = require('../../models/index.js');
// const asyncHandler = require('../utils/asyncHandler');

import { ROLES, ESTADOS, TIPOS_ROSTER } from '../utils/constantes.js';
import { sequelize } from '../../models/index.js';
import asyncHandler from '../utils/asyncHandler.js';

const roles = (req, res) => res.status(200).json(ROLES);
const estados = (req, res) => res.status(200).json(ESTADOS);
const tiposRoster = (req, res) => res.status(200).json(TIPOS_ROSTER);

// Verifica que el API responde y que la base de datos está accesible
const health = asyncHandler(async (req, res) => {
  await sequelize.authenticate();
  res.status(200).json({ status: 'ok', database: 'connected' });
});

export { roles, estados, tiposRoster, health };