'use strict';


const rosterJugador = (sequelize, DataTypes) => {
  const RosterJugador = sequelize.define('RosterJugador', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_roster: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_jugador: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    rol_en_roster: {
      type: DataTypes.ENUM('Titular', 'Suplente'),
      allowNull: false
    }
  }, {
    tableName: 'roster_jugadores',
    timestamps: false
  });

  return RosterJugador;
};

export default rosterJugador;