'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('rosters', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      nombre: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      juego: {
        type: Sequelize.STRING(100),
        allowNull: false,
        defaultValue: 'League of Legends'
      },
      tipo: {
        type: Sequelize.ENUM('Principal', 'Academy'),
        allowNull: false
      },
      temporada: {
        type: Sequelize.STRING(10),
        allowNull: false
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('rosters');
  }
};