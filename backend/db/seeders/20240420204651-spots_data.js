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
          description: `About this space
Welcome to Lost Ridge! Please review details including the Things to Know and let us know if you have any questions!
The space
Lost Ridge is a thoughtfully crafted luxury home on 10 acres offering breathtaking year-round long range mountain views from its private setting south of Blowing Rock.

Enter the main level from the parking area up just 4 steps to a large deck. The front door opens into the spacious great room which features a wood burning fireplace between 14-foot tall windows allowing all the natural light and open, airy feeling you could ever want. The floor to ceiling windows make you feel that you are truly a part of the surrounding landscape while offering stunning, unobstructed mountain views.

On the south side of the great room is the fully-equipped kitchen featuring a custom built island, stainless steel European appliances including gas range, and high quality silverware, knives, and cookware. There’s room for 4 at the eat-in counter at the island, as well.

At either end of the great room is a luxurious bedroom suite. The King suite offers a TV and sliding doors to the deck, as well as a private bathroom with a custom tiled shower. The Queen suite offers a sleek gas log fireplace and sliding doors to the deck, as well as a private bathroom with tiled shower. Each bedroom also offers solar shades for those who don’t want to rise with the sun.

Outside is a large deck with chairs to kick back and relax while you enjoy the views. Enjoy grilling on the charcoal grill. After dark, roast marshmallows and hang out around the campfire outside, then go inside and crank up your favorite vinyl on the vintage record player!

Lost Ridge was designed as a sustainable net-zero off-grid retreat. There are solar panels at the home, and it is now connected to the main power grid as well with the solar panels being grid-tied so that the goal of sustainability is still met. The home offers in-floor radiant heat throughout, solar shades, and efficient mini-splits for cooling needs.

Lost Ridge is intentionally situated off the beaten path with the goal of guests leaving renewed and refreshed. If you still desire a bit of city life, it is only a 30 minute drive from beautiful Boone and Blowing Rock where you can enjoy restaurants and shopping. Boone and Blowing Rock are both beautiful destinations that were very recently rated on Southern Living's Top 50 Small Towns!


Additional Notes:
- All BRMR homes offer well stocked kitchens with all utensils needed to cook meals. There is also a "starter set" of paper products at the house: a roll of toilet paper per bath, a couple garbage bags, a small vial of dishwashing liquid, a few tablets of dishwasher detergent, some laundry pods, a roll of paper towels, hand soap, shampoo, conditioner, body wash, and some makeup remover cloths. There are enough of these items for one night, or maybe two. We do not provide hair dryers. Towels and linens are provided for you.
- Firewood may be purchased with a week's notice. A night’s worth is two wrapped, kiln-dried bundles and a fire starter for $25 plus tax. Let us know how many nights worth you would like to purchase.
- AWD or 4WD vehicles are required during winter months. The road leading to this home starts as paved then turns to gravel and is moderately steep. Home is a distance from a grocery store.
- Lost Ridge has parking space for up to 2 vehicles.
- Internet is currently Satellite-based with a monthly data cap. It's adequate for checking emails and general web browsing but should NOT be used for streaming, videos, or gaming activities. Depending on your phone carrier, your cell phone signal may or may not work in this location. Verizon is the best coverage here. If your wireless plan supports it you can use your phone's data as a hotspot.

Rules
• This property is not pet friendly. Please do not ask for an exception. Thank you for helping to keep this home pet-free
• Must be at least 25 years old to reserve. This person is required to be one of the persons staying in the property for the reserved dates.
• No smoking inside the home. No trace of smoking left outside the home.
• Do not leave food or trash outside as it could attract animals.
• No parties or gatherings above the posted occupancy allowed. Keep outside noise respectable.
• The main roads are plowed in winter, but 4WD/AWD and/or chains recommended during winter- it is your responsibility to come prepared for winter weather. No refunds are given if you are not prepared for winter weather.
• Guest is responsible for any damages caused by intentional (non-accidental) actions.
• Host is not responsible for items left in the home.
• Must electronically sign an additional Rental Agreement Terms and Conditions sent by Host (property manager) within 60 days of arrival.`,
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
