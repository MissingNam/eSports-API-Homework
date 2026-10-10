const { ROLES, ESTADOS, TIPOS_ROSTER } = require('../utils/constantes');
const { sequelize } = require('../../models');
const asyncHandler = require('../utils/asyncHandler');

const roles = (req, res) => res.status(200).json(ROLES);
const estados = (req, res) => res.status(200).json(ESTADOS);
const tiposRoster = (req, res) => res.status(200).json(TIPOS_ROSTER);

// Verifica que el API responde y que la base de datos está accesible
const health = asyncHandler(async (req, res) => {
  await sequelize.authenticate();
  res.status(200).json({ status: 'ok', database: 'connected' });
});

module.exports = { roles, estados, tiposRoster, health };