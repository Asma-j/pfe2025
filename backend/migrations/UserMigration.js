'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Utilisateurs', 'niveau_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn('Utilisateurs', 'matiere_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Utilisateurs', 'niveau_id');
    await queryInterface.removeColumn('Utilisateurs', 'matiere_id');
  },
};