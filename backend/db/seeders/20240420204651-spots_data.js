'use strict';
const { Spot } = require('../models')
/** @type {import('sequelize-cli').Migration} */

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

module.exports = {
  async up (queryInterface, Sequelize) {
    await Spot.bulkCreate([
      {
        ownerId: 2,
        address: '123 main st',
        city: 'Saugus',
        state: 'MA',
        country: 'America',
        lat: 13.123412,
        lng: -34.51725,
        name: 'Nice house',
        description: 'Great house to rent for the weekend',
        price: 412
      },
      {
        ownerId: 2,
        address: '124 main st',
        city: 'Saugus',
        state: 'MA',
        country: 'America',
        lat: 13.123412,
        lng: -34.51725,
        name: 'Nice house',
        description: 'Great house to rent for the weekend',
        price: 412
      },
      {
        ownerId: 2,
        address: '125 main st',
        city: 'Saugus',
        state: 'MA',
        country: 'America',
        lat: 13.123412,
        lng: -34.51725,
        name: 'Nice house',
        description: 'Great house to rent for the weekend',
        price: 412
      }
    ], { validate: true });
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Spots';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      address: { [Op.in]: ['123 main st', '124 main st', '125 main st'] }
    }, {});
  }
};
