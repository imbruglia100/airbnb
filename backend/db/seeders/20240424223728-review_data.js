'use strict';

/** @type {import('sequelize-cli').Migration} */

const { Review } = require('../models')

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

module.exports = {
  async up (queryInterface, Sequelize) {
    await Review.bulkCreate([
      {
        userId: 3,
        spotId: 1,
        review: "This was an awesome spot!",
        stars: 5,
      },
      {
        userId: 2,
        spotId: 4,
        review: "This was an awesome spot would recommend!",
        stars: 3,
      },
      {
        userId: 1,
        spotId: 3,
        review: "This was an awesome spot will try again!",
        stars: 5,
      },
    ], { validate: true });
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Reviews';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      review: { [Op.in]: [
        "This was an awesome spot!",
        "This was an awesome spot would recommend!",
        "This was an awesome spot will try again!"
    ] }
    }, {});
  }
};
