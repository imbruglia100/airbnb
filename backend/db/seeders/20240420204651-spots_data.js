/** @format */

"use strict";
const { Spot } = require("../models");
/** @type {import('sequelize-cli').Migration} */

let options = {};
if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA; // define your schema in options object
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await Spot.bulkCreate(
      [
        {
          ownerId: 1,
          address: "123 main st",
          city: "Lenoir",
          state: "NC",
          country: "United States",
          lat: 13.123412,
          lng: -34.51725,
          name: "Lost Ridge - Luxury Tiny House w/ Stunning Views!",
          description: `
Welcome to Lost Ridge! Please review details including the Things to Know and let us know if you have any questions!`,
          price: 367,
        },
      ],
      { validate: true }
    );
  },

  async down(queryInterface, Sequelize) {
    options.tableName = "Spots";
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(
      options,
      {
        address: {
          [Op.in]: ["123 main st", "124 main st", "125 main st", "126 sdaw st"],
        },
      },
      {}
    );
  },
};
