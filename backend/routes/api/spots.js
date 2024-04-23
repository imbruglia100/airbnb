const express = require('express');
const { Spot, User, SpotImage } = require('../../db/models');

const router = express.Router()

router.post('/:spotId/images', async (req, res) => {
    if(!req.user) return res.status(400).json({
        "message": "Authentication required"
      })
    let { spotId } = req.params
    const { url, preview } = req.body

    spotId = +spotId
    const spot = await Spot.findOne({
        where: {
            id: spotId
        }
    })

    if(spot.ownerId !== +req.user.id) return res.status(400).json({message: 'You do not own this spot'})

    const newImage = await SpotImage.create({
        spotId,
        url,
        preview
    })

    res.json({newImage})
})

router.get('/current', async (req, res) => {
    if(!req.user) return res.status(400).json({
        "message": "Authentication required"
      })
      const ownerId = +req.user.id
      const where = { ownerId }

    //need to add avgRating
    const spots = await Spot.findAll({
        where,
         include:{
            model: SpotImage
        }
    })

    if(spots.length === 0)return res.json({message: "You have no spots!"})

    res.json({spots})
})

router.get('/:spotId', async (req, res) => {
    const {spotId} = req.params

    if(!spotId)return res.json({message: "No spot selected."})

    const where = {id: +spotId}
    //add numReviews, avgStarRating
    const spots = await Spot.findOne({
        where,
        include: [{
            model: User,
            as: 'Owner',
            attributes: [
                'id',
                'firstName',
                'lastName'
            ]
        }, {
            model: SpotImage
        }]
    })

    if(!spots)return res.json({message: "Spot couldn't be found"})

    res.json({spots})
})

router.put('/:spotId', async (req, res) => {
    if(!req.user) return res.status(400).json({
        "message": "Authentication required"
      })
    let { spotId } = req.params
    spotId = +spotId
    const spot = await Spot.findOne({
        where: {
            id: spotId
        }
    })

    if(spot.ownerId !== +req.user.id) return res.status(400).json({message: 'You do not own this spot'})

    const body = req.body
    const updatedSpotBody = {
        address: body.address || spot.address,
        city: body.city || spot.city,
        state: body.state || spot.state,
        country: body.country || spot.country,
        lat: body.lat || spot.lat,
        lng: body.lng || spot.lng,
        name: body.name || spot.name,
        description: body.description || spot.description,
        price: body.price || spot.price
    }

    const updatedSpot = await spot.update(updatedSpotBody)

    res.json({updatedSpot})
})

router.delete('/:spotId', async (req, res) => {
    if(!req.user) return res.status(400).json({
        "message": "Authentication required"
      })
    let { spotId } = req.params
    spotId = +spotId
    const spot = await Spot.findOne({
        where: {
            id: spotId
        }
    })

    if(spot.ownerId !== +req.user.id) return res.status(400).json({message: 'You do not own this spot'})

    await Spot.destroy({
        where: {
            id: spotId
        }
    })

    res.json({message: "Successfully deleted"})
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
