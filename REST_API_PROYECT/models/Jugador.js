const Jugador = (sequelize, DataTypes) => {
  const Jugador = sequelize.define('Jugador', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nickname: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: { msg: 'El nickname es obligatorio' }
      }
    },
    nombre_real: DataTypes.STRING(100),
    pais: DataTypes.STRING(60),
    rol: {
      type: DataTypes.ENUM('Top', 'Jungle', 'Mid', 'ADC', 'Support'),
      allowNull: false,
      validate: {
        isIn: {
          args: [['Top', 'Jungle', 'Mid', 'ADC', 'Support']],
          msg: 'Rol inválido'
        }
      }
    },
    estado: { // NO HABIA NECESIDAD DE HUMILLARME TANTO POR ESCRIBIR "INCATIVO" EN LUGAR DE "INACTIVO" :'(
      type: DataTypes.ENUM('activo', 'inactivo'),
      allowNull: false,
      defaultValue: 'activo'
    }
  }, {
    tableName: 'jugadores',
    timestamps: false
  });

  Jugador.associate = (models) => {
    Jugador.belongsToMany(models.Roster, {
      through: models.RosterJugador,
      foreignKey: 'id_jugador',
      otherKey: 'id_roster',
      as: 'rosters'
    });
  };

  return Jugador;
};

export default Jugador;