const express = require('express');
const { Spot } = require('../../db/models');
const { User } = require('../../db/models');

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
    if(!req.user) return res.status(400).json({
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
    if(!req.user) return res.status(400).json({
        "message": "Authentication required"
      })

    const errors = {}
    const ownerId = req.user.id
    const {address, city, state, country, lat, lng, name, description, price} = req.body

    if(!address || typeof address !== 'string' ) errors.address = "Street address is required"
    if(!city || typeof city !== 'string' ) errors.city = "City is required"
    if(!state || typeof state !== 'string' ) errors.state = "State is required"
    if(!country || typeof country !== 'string' ) errors.country = "Country is required"
    if(!lat || lat > 90 || lat < -90 ) errors.lat = "Latitude must be within -90 and 90"
    if(!lng || lng > 180 || lng < -180  ) errors.lng = "Longitude must be within -180 and 180"
    if(!name || typeof name !== 'string' || name.length > 50 ) errors.name = "Name must be less than 50 characters"
    if(!description || typeof description !== 'string' ) errors.name = "Description is required"
    if(!price || price < 0 ) errors.name = "Price per day must be a positive number"

    if(Object.keys(errors).length > 0){
        return res.status(400).json({message: "Bad Request", errors})
    }
    
    const newSpot = await Spot.create({
        ownerId,
        address,
        city,
        state,
        country,
        lat,
        lng,
        name,
        description,
        price
    })

    return res.status(201).json(newSpot)
})

module.exports = router;
