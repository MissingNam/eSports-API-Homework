// require('dotenv').config();
// const express = require('express');
// const jugadoresRoutes = require('./routes/jugadores.routes');
// const errorHandler = require('./middlewares/errorHandler');
// const rostersRoutes = require('./routes/rosters.routes');
// const auxiliaresRoutes = require('./routes/auxiliares.routes');
// const fs = require('fs');
// const path = require('path');
// const YAML = require('yaml');
// const swaggerUi = require('swagger-ui-express');
// const autenticacionRoutes = require('./routes/autenticacion.routes');
// const cors = require('cors');
// const cookieParser = require('cookie-parser');
  
import 'dotenv/config';   // DEBE ir primero: carga el .env antes de que otros modulos lean process.env
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import YAML from 'yaml';
import swaggerUi from 'swagger-ui-express';
import jugadoresRoutes from './routes/jugadores.routes.js';
import rostersRoutes from './routes/rosters.routes.js';
import auxiliaresRoutes from './routes/auxiliares.routes.js';
import autenticacionRoutes from './routes/autenticacion.routes.js';
import { errorHandler } from './middlewares/errorHandler.js';

// En ESM no existe __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// permite leer el body JSON
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN,
  credentials: true,
  allowedHeaders: ['Content-Type', 'X-CSRF-Token']
}));
app.use(cookieParser());

// Documentación OpenAPI
const openapiSpec = YAML.parse(
  fs.readFileSync(path.join(__dirname, '..', 'docs', 'openapi.yaml'), 'utf8')
);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpec));

app.use('/api/v1/jugadores', jugadoresRoutes);
app.use('/api/v1/rosters', rostersRoutes);
app.use('/api/v1', auxiliaresRoutes);



app.use('/api/v1/auth', autenticacionRoutes);

// Ruta inexistente
app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));


app.use(errorHandler);                          // siempre al final

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API en http://localhost:${PORT}`));

export {app};