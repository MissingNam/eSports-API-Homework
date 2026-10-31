import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import Sequelize from 'sequelize';
import configFile from '../config/config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const env = process.env.NODE_ENV || 'development';
const config = configFile[env];

const sequelize = new Sequelize(config.database, config.username, config.password, config);

const db = {};

const archivos = fs
  .readdirSync(__dirname)
  .filter((file) => file.indexOf('.') !== 0 && file !== path.basename(__filename) && file.slice(-3) === '.js');


for (const file of archivos) {
  const { default: definirModelo } = await import(pathToFileURL(path.join(__dirname, file)).href);
  const model = definirModelo(sequelize, Sequelize.DataTypes);
  db[model.name] = model;
}

Object.keys(db).forEach((name) => {
  if (db[name].associate) db[name].associate(db);
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Exports con nombre (para: import { Jugador, sequelize } from '../../models/index.js')
const { Admin, Jugador, Roster, RosterJugador, Usuario } = db;
export { sequelize, Sequelize, Admin, Jugador, Roster, RosterJugador, Usuario };

// Export por defecto (para: import db from '../../models/index.js')
export default { db } ;
