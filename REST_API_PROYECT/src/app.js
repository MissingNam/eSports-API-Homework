require('dotenv').config();
const express = require('express');
const jugadoresRoutes = require('./routes/jugadores.routes');
const errorHandler = require('./middlewares/errorHandler');
const rostersRoutes = require('./routes/rosters.routes');
const auxiliaresRoutes = require('./routes/auxiliares.routes');
const fs = require('fs');
const path = require('path');
const YAML = require('yaml');
const swaggerUi = require('swagger-ui-express');
const autenticacionRoutes = require('./routes/autenticacion.routes');
const cors = require('cors');
const cookieParser = require('cookie-parser');


const app = express();

app.use(express.json());   

// permite leer el body JSON
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN,
  credentials: true,
  allowedHeaders: ['Content-Type', 'X-CSRF-Token']
}));
app.use(express.json());
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

module.exports = app;