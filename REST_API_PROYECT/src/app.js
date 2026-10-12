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

const app = express();

app.use(express.json());                        // permite leer el body JSON

// Documentación OpenAPI
const openapiSpec = YAML.parse(
  fs.readFileSync(path.join(__dirname, '..', 'docs', 'openapi.yaml'), 'utf8')
);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpec));

app.use('/api/v1/jugadores', jugadoresRoutes);
app.use('/api/v1/rosters', rostersRoutes);
app.use('/api/v1', auxiliaresRoutes);

// Ruta inexistente
app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));

app.use(errorHandler);                          // siempre al final

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API en http://localhost:${PORT}`));

module.exports = app;