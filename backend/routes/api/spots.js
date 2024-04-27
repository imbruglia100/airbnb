const express = require('express');
const { Spot, User, SpotImage, Review } = require('../../db/models');
const Sequelize = require('sequelize')
const router = express.Router()

router.get('/:spotId/reviews', async (req, res) => {
    let spotId = +req.params.spotId

    const spot = await Spot.findOne({
        where: {
            id: spotId
        }
    })
    if(!spot)return res.status(404).json({error: "Spot does not exist"})

    const reviews = await Review.findAll({
        where: {
            spotId
        }
    })

    if(reviews.length === 0)return res.json('There are no reviews :(')

    res.json({reviews})
})

router.post('/:spotId/reviews', async (req, res) => {
    if(!req.user) return res.status(401).json({
        "message": "Authentication required"
      })

    let spotId = +req.params.spotId

    const {review, stars} = req.body

    const spot = await Spot.findOne({
        where: {
            id: spotId
        }
    })
    if(!spot)return res.status(404).json({error: "Spot does not exist"})

    const newReview = await Review.create({
        userId: +req.user.id,
        spotId,
        review,
        stars
    })

    await newReview.save()

    res.json({newReview})
})

router.post('/:spotId/images', async (req, res) => {
    if(!req.user) return res.status(401).json({
        "message": "Authentication required"
      })
    let { spotId } = req.params
    const { url, preview } = req.body

    const spot = await Spot.findOne({
        where: {
            id: +spotId
        }
    })
    if(!spot)return res.status(400).json({error: "Spot does not exist"})

    if(spot.ownerId !== +req.user.id) return res.status(403).json({"message": "Forbidden"})

    const newImage = await SpotImage.create({
        spotId,
        url,
        preview
    })

    res.json({newImage})
})

router.get('/current', async (req, res) => {
    if(!req.user) return res.status(401).json({
        "message": "Authentication required"
      })
      const ownerId = +req.user.id
      const where = { ownerId }

    const spots = await Spot.findAll({
        where,
         include:[{
            model: SpotImage
        },
        {
            model: Review,
            attributes: []
        }],
        attributes: [
            ...Object.keys(Spot.tableAttributes),
            [Sequelize.fn('AVG', Sequelize.col('reviews.stars')), 'avgRating']
        ]
    })
    console.log(spots)
    if(spots.length === 0)return res.json({message: "You have no spots!"})
    if(!spots[0].id)return res.json({message: "You have no spots!"})

    res.json({spots})
})

router.get('/:spotId', async (req, res) => {
    const {spotId} = req.params

    if(!spotId)return res.json({message: "No spot selected."})

    const where = {id: +spotId}
    const spot = await Spot.findOne({
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
            model: SpotImage,
            required: false
        }, {
            model: Review,
            retuired: false,
            attributes: []
        }],
        attributes:{
            include: [
                [Sequelize.col('spotimages.url'), 'previewImages'],
                [Sequelize.fn('AVG', Sequelize.col('reviews.stars')), 'avgStarRating'],
            ],
        },
    })

    if(!spot)return res.json({message: "Spot couldn't be found"})

    res.json({spot})
})

router.put('/:spotId', async (req, res) => {
    if(!req.user) return res.status(401).json({
        "message": "Authentication required"
      })
    let { spotId } = req.params
    spotId = +spotId
    const spot = await Spot.findOne({
        where: {
            id: spotId
        }
    })

    if(!spot)return res.status(404).json({message: "Spot couldn't be found"})

    if(spot.ownerId !== +req.user.id) return res.status(403).json({"message": "Forbidden"})

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
    if(!req.user) return res.status(401).json({
        "message": "Authentication required"
      })
    let { spotId } = req.params
    let id = +spotId
    const spot = await Spot.findOne({
        where: {
            id
        }
    })
    if(!spot)return res.status(404).json({message: 'Spot could not be found'})
    if(spot.ownerId !== +req.user.id) return res.status(403).json({"message": "Forbidden"})
    await SpotImage.destroy({
        where: {
            spotId: id
        }
    })
    await Spot.destroy({
        where: {
            id: spotId
        }
    })

    res.json({message: "Successfully deleted"})
})


router.get('/', async (req, res) => {
    let spots = await Spot.findAll({
        include: [{
            model: SpotImage,
            required: false,
            attributes: [],
            where: {
                preview: true
            },
        },
        {
            model: Review,
            required: false,
            attributes: [],
        }
         ],
        // attributes:{
        //     include: [
        //         [Sequelize.fn('AVG', Sequelize.col('reviews.stars')), 'avgRating'],
        //         [Sequelize.col('spotimages.url'), 'previewImages'],
        //     ],
        // },
    })


    if(!spots.length === 0 )return res.json({message: "No spots avalible"})
    if(!spots[0].id)return res.json({message: "No spots avalible"})

    res.json({spots})
})

router.post('/', async (req, res) => {
    if(!req.user) return res.status(401).json({
        "message": "Authentication required"
      })

    const errors = {}
    const ownerId = +req.user.id
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
