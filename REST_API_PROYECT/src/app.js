require('dotenv').config();
const express = require('express');
const jugadoresRoutes = require('./routes/jugadores.routes');
const errorHandler = require('./middlewares/errorHandler');
const rostersRoutes = require('./routes/rosters.routes');
const auxiliaresRoutes = require('./routes/auxiliares.routes');

const app = express();

app.use(express.json());                        // permite leer el body JSON
app.use('/api/v1/jugadores', jugadoresRoutes);
app.use('/api/v1/rosters', rostersRoutes);
app.use('/api/v1', auxiliaresRoutes);

// Ruta inexistente
app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));

app.use(errorHandler);                          // siempre al final

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API en http://localhost:${PORT}`));

module.exports = app;