const Roster = (sequelize, DataTypes) =>{
  const Roster = sequelize.define('Roster', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'El nombre es obligatorio' }
      }
    },
    juego: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: 'League of Legends'
    },
    temporada: {
      type: DataTypes.STRING(10),
      allowNull: false
    }, 
    tipo: {
      type: DataTypes.ENUM('Principal', 'Academy'),
      allowNull: false,
      validate: {
        isIn: {
          args: [['Principal', 'Academy']],
          msg: 'Tipo inválido (Principal o Academy)'
        }
      }
    }
  }, {
    tableName: 'rosters',
    timestamps: false
  });

  Roster.associate = (models) => {
    Roster.belongsToMany(models.Jugador, {
      through: models.RosterJugador,
      foreignKey: 'id_roster',
      otherKey: 'id_jugador',
      as: { singular: 'jugador', plural: 'jugadores' }
    });
  };

  return Roster;
};

export default Roster;