'use strict';
const { SpotImage } = require('../models')

/** @type {import('sequelize-cli').Migration} */

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

module.exports = {
  async up (queryInterface, Sequelize) {
    await SpotImage.bulkCreate([
      {
        spotId: 1,
        url: 'https://a0.muscache.com/im/pictures/prohost-api/Hosting-797888716801864029/original/5a208c6c-165e-448c-8dd4-8b7ac5efb3cc.jpeg?im_w=1200',
        preview: true
      },
      {
        spotId: 1,
        url: 'https://a0.muscache.com/im/pictures/prohost-api/Hosting-797888716801864029/original/c4640fed-e92c-4d93-b93c-9b80aec30e9e.jpeg?im_w=720',
        preview: false
      },
      {
        spotId: 1,
        url: 'https://a0.muscache.com/im/pictures/prohost-api/Hosting-797888716801864029/original/624cc318-9868-4867-b525-4aaf2421a1c2.jpeg?im_w=720',
        preview: false
      },
    ], { validate: true });
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'SpotImages';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      url: { [Op.in]: ['url1', 'url2', 'url3'] }
    }, {});
  }
};
