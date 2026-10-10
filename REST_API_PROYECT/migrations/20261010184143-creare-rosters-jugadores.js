'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('roster_jugadores', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      id_roster: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'rosters', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      id_jugador: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'jugadores', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      rol_en_roster: {
        type: Sequelize.ENUM('Titular', 'Suplente'),
        allowNull: false
      }
    });

    // Un jugador no puede estar dos veces en el mismo roster
    await queryInterface.addIndex('roster_jugadores', ['id_roster', 'id_jugador'], {
      unique: true,
      name: 'uq_roster_jugador'
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('roster_jugadores');
  }
};