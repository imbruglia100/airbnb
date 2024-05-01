const express = require('express');
const { Spot, User, SpotImage, Review, Booking } = require('../../db/models');
const Sequelize = require('sequelize');
const { requireAuth } = require('../../utils/auth');
const { Op } = require('sequelize')

const router = express.Router()

router.get('/:spotId/bookings', requireAuth, async (req, res) => {
    const spotId = +req.params.spotId

    const spot = await Spot.findByPk(spotId)

    let bookings = {}

    if(spot.ownerId === +req.user.id){
        bookings = await Booking.findAll({
            where: {
                spotId
            },
            include: User
        })
    }else{
        bookings = await Booking.findAll({
            where: {
                spotId
            },
            attributes: {
                exclude: ['userId', 'createdAt', 'updatedAt']
            }
        })
    }

    if(bookings.length === 0) return res.status(404).json({message: "No bookings found"})

    return res.json({bookings})
})

router.post('/:spotId/bookings', [
    requireAuth
], async (req, res) => {
    const spotId = +req.params.spotId
    let errors = {}
    const { startDate, endDate } = req.body


    if(Date.parse(startDate) > Date.parse(endDate)) errors.endDate = "endDate cannot be on or before startDate"

    if(Date.now() > Date.parse(startDate)) errors.startDate = "startDate cannot be in the past"

    if(Object.keys(errors) > 0)return res.status(400).json({message: 'Bad request', errors})


    const spot = await Spot.findByPk(spotId)
    if(!spot) return res.status(404).json({message: "Spot couldn't be found"})

    if(+req.user.id === spot.ownerId)return res.status(400).json({error: 'Owner cannot book a spot'})

    const overLappingBooking = await Booking.findOne({
        where: {
            spotId,
            endDate: {
                [Sequelize.Op.gt]: this.startDate
            },
            startDate: {
                [Sequelize.Op.lt]: this.endDate
            }
        }
    })

    if(overLappingBooking)return res.status(403).json({
        "message": "Sorry, this spot is already booked for the specified dates",
        "errors": {
          Overbooked: "This spot time is already taken"
        }
      })

    const newBooking = await Booking.create({
        spotId,
        userId: +req.user.id,
        startDate,
        endDate
    })
    return res.json({newBooking})
})

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

router.post('/:spotId/reviews', requireAuth, async (req, res) => {

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

router.post('/:spotId/images', requireAuth, async (req, res) => {
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

router.get('/current', requireAuth, async (req, res) => {
      const ownerId = +req.user.id
      const where = { ownerId }

    const spots = await Spot.findAll({
        where,
         include:[{
            model: SpotImage,
            required: false
        },
        {
            model: Review,
            required: false,
            attributes: ['stars']
        }],

    })

    if(spots.length === 0)return res.json({message: "You have no spots!"})
    if(!spots[0].id)return res.json({message: "You have no spots!"})

    const spotsWithAvgStars = spots.map(spot => {
        const reviews = spot.Reviews || [];
        const totalStars = reviews.reduce((acc, review) => acc + review.stars, 0);
        const avgStars = totalStars / (reviews.length || 1);
        return {
            ...spot.toJSON(),
            avgStars
        };
    });

    res.json({spots: spotsWithAvgStars})
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
                [Sequelize.col('SpotImages.url'), 'previewImages']
            ],
        },
    })

    if(!spot)return res.json({message: "Spot couldn't be found"})

    const reviews = await Review.findAll({
        where:{
            spotId: spot.id
        }
    })

    const length = reviews.length
    const sum = reviews.reduce((a, review) => a + review.stars, 0)
    let avgStarRating = null

    if(length) avgStarRating = sum / length

    res.json({...spot.toJSON(), avgStarRating})
})

router.put('/:spotId', requireAuth, async (req, res) => {
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

router.delete('/:spotId', requireAuth, async (req, res) => {

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

    let {page, size, minLat, maxLat, minLng, maxLng, minPrice, maxPrice} = req.query

    if(!size || size <= 0 || size > 20) size = 20;

    if(!page || page <= 0) page = 1;

    if(!minLat) minLat = -90
    if(!maxLat) maxLat = 90

    if(!minLng) minLng = -180
    if(!maxLng) maxLng = 180

    if(!minPrice) minPrice = 0
    if(!maxPrice) maxPrice = 100000000

    const offset = +size * (+page - 1)
    const limit = +size

    const where = {
        lat: {
            [Op.between]: [minLat, maxLat],
        },
        lng: {
            [Op.between]: [minLng, maxLng]
        },
        price: {
            [Op.between]: [minPrice, maxPrice]
        }
    }

    try{
    let spots = await Spot.findAll({
        where,
        offset,
        limit,

        include: [
            {
            model: SpotImage,
            required: false,
            attributes: ['url'],
            where: {
                preview: true,
            },
        },
        {
            model: Review,
            required: false,
            attributes: ['stars'],
        }
         ],
    })

    if(!spots.length === 0 )return res.json({message: "No spots avalible"})

     spots = spots.map(spot => {
        const reviews = spot.Reviews || [];
        const totalStars = reviews.reduce((acc, review) => acc + review.stars, 0);
        const avgStars = totalStars / (reviews.length || 1);
        return {
            ...spot.toJSON(),
            previewImage: spot.SpotImages.length > 0 ? [...spot.SpotImages] : null,
            SpotImages: null,
            avgStars
        };
    });

    res.json({spots})
    }catch(e){
        console.log(e)
    }
})

router.post('/', requireAuth, async (req, res) => {
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
    if(!description || typeof description !== 'string' ) errors.description = "Description is required"
    if(!price || price < 0 ) errors.price = "Price per day must be a positive number"

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
