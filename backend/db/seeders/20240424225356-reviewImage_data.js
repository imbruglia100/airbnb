'use strict';

const { ReviewImage } = require('../models')

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await ReviewImage.bulkCreate([
      {
        reviewId: 1,
        url: 'https://a0.muscache.com/im/pictures/prohost-api/Hosting-797888716801864029/original/03fe2a3e-f4b2-4c8e-8acc-c6ebe9489264.jpeg?im_w=720'
      }
    ], { validate: true });
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'ReviewImages';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      review: { [Op.in]: [
        'url1',
        'url2',
        'url3'
    ] }
    }, {});
  }
};
