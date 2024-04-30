const express = require('express');
const { SpotImage, Spot } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');
const { json } = require('sequelize');

const router = express.Router()

router.delete('/:imageId', requireAuth, async (req, res) => {
    const spotImg = await SpotImage.findOne({
        where: {
            id: +req.params.imageId
        }
    })

    if(!spotImg) return res.status(404).json({message: "Spot Image couldn't be found"})

    const spot = await Spot.findOne({
        where: {
            id: +spotImg.spotId
        }
    })

    if(spot.ownerId !== +req.user.id)return res.status(403).json({message: "You are not the owner of this spot"})

    await spotImg.destroy()

    return res.json({
        "message": "Successfully deleted"
      })
})


module.exports = router;
