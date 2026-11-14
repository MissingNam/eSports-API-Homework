const Usuario = (sequelize, DataTypes) => {
  const Usuario = sequelize.define('Usuario', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      google_id: {
        type: DataTypes.STRING(255),
        allowNull: true,   // <- antes false
        unique: true
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true
      },
      nombre: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      foto: {
        type: DataTypes.STRING(500),
        allowNull: true
      },
      password_hash: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      creado_en: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      ultimo_acceso: {
        type: DataTypes.DATE,
        allowNull: true
      }
    }, {
      tableName: 'usuarios',
      timestamps: false
    });

  return Usuario;
};

export default Usuario;