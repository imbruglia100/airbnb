const express = require('express');
const { Spot } = require('../../db/models');
const {User} = require('../../db/models');
const router = express.Router()

router.get('/:spotId', async (req, res) => {
    const {spotId} = req.params

    if(!spotId)return res.json({message: "No spot selected."})

    const where = {id: +spotId}
    //add numReviews, avgStarRating, spotImages
    const spots = await Spot.findOne({
        where,
        include: {
            model: User,
            as: 'Owner',
            attributes: [
                'id',
                'firstName',
                'lastName'
            ]
        }
    })

    if(!spots)return res.json({message: "Spot couldn't be found"})

    res.json({spots})
})

router.get('/current', async (req, res) => {
    if(!req.user) return res.json({
        "message": "Authentication required"
      })

    const where = {ownerId: req.user.id}

    //need to add avgRating and previewImages
    const spots = await Spot.findAll({
        where
    })

    if(!spots)return res.json({message: "You have no spots!"})

    res.json({spots})
})

router.get('/', async (req, res) => {
    //need to add avgRating and previewImages
    const spots = await Spot.findAll()

    if(!spots)return res.json({message: "No spots avalible"})

    res.json({spots})
})

router.post('/', async (req, res) => {
    //need to add avgRating and previewImages
    const spots = await Spot.findAll()

    if(!spots)return res.json({message: "No spots avalible"})

    res.json({spots})
})

module.exports = router;
