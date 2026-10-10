const { sequelize, Jugador, Roster } = require('./models');

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexión OK');

    const j = await Jugador.create({
      nickname: 'Faker',
      nombre_real: 'Lee Sang-hyeok',
      pais: 'Corea del Sur',
      rol: 'Mid'
    });
    console.log('Creado:', j.toJSON());

    const r = await Roster.create({
      nombre: 'TL Principal',
      tipo: 'Principal',
      temporada: '2025'
    });
    await r.addJugador(j, { through: { rol_en_roster: 'Titular' } });

    const detalle = await Roster.findByPk(r.id, { include: 'jugadores' });
    console.log(JSON.stringify(detalle, null, 2));
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await sequelize.close();
  }
})();