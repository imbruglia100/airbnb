'use strict';

const { Booking } = require('../models');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {

  async up (queryInterface, Sequelize) {
    try{
    await Booking.bulkCreate([
      {
        spotId: 1,
        userId: 1,
        startDate: "2026-12-21",
        endDate: "2026-12-30"
      },
      {
        spotId: 2,
        userId: 2,
        startDate: "2027-12-21",
        endDate: "2027-12-30"
      },
      {
        spotId: 3,
        userId: 3,
        startDate: "2028-12-21",
        endDate: "2028-12-30"
      }
    ], { validate: true });
  }catch(e){
    console.log(e)
  }
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Bookings';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      id: { [Op.in]: [
        1, 2, 3
    ] }
    }, {});
  }
};
