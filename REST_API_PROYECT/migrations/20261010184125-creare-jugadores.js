'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('jugadores', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      nickname:{
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      nombre_real: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      pais: {
        type: Sequelize.STRING(60),
        allowNull: true
      },
      rol: {
        type: Sequelize.ENUM('Top','Jungle','Mid','ADC','Support'),
        allowNull: false
      },
      estado: {
        type: Sequelize.ENUM('activo','incativo'),
        allowNull: false,
        defaultValue: 'activo'
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('jugadores');
  }
}