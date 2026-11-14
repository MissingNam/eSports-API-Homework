'use strict';

export default {
  async up(queryInterface, Sequelize) {
    // google_id pasa a ser opcional: las cuentas locales no lo tienen (el índice único se conserva)
    await queryInterface.changeColumn('usuarios', 'google_id', {
      type: Sequelize.STRING(255),
      allowNull: true
    });
    await queryInterface.addColumn('usuarios', 'password_hash', {
      type: Sequelize.STRING(255),
      allowNull: true // las cuentas de Google no tienen contraseña
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('usuarios', 'password_hash');
    // Falla si ya existen cuentas locales (google_id nulo): bórralas antes de hacer undo
    await queryInterface.changeColumn('usuarios', 'google_id', {
      type: Sequelize.STRING(255),
      allowNull: false
    });
  }
};