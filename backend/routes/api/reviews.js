const express = require('express');
const { Review, Spot, ReviewImage, User, SpotImage } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');

const router = express.Router()

router.post('/:reviewId/images', requireAuth, async (req, res) => {

    const reviewId = +req.params.reviewId
    const {url} = req.body
    const review = await Review.findByPk(reviewId)
    if(!url)return res.json('Url cannot be null')
    if(!review)return res.status(404).json({message: "Review couldn't be found"})

    if(review.userId !== +req.user.id) return res.status(403).json({"message": "Forbidden"})

    const imgCount = await ReviewImage.count({
        where: {
            reviewId
        }
    })

    if(imgCount && imgCount >= 10)return res.status(403).json({"message": "Maximum number of images for this resource was reached"})

    const newImg = await ReviewImage.create({
        reviewId,
        url
    })

    res.json({id: newImg.id, url: newImg.url})
})

router.get('/current', requireAuth, async (req, res) => {

    const userId = +req.user.id
    const where = {}
    where.userId = userId

    const reviews = await Review.findAll({
        where,
        include: [{
            model: Spot,
            include: {
                model: SpotImage,
                where: {
                preview: true
            }}
        },{
            model: ReviewImage,
            attributes: ["id", "url"]
        }, {
            model: User,
            attributes: ["id", 'firstName', "lastName"]
        }]
    })

    // const previewImage = reviews[0].toJSON().ReviewImages.filter( img => img.preview === true)

    if(reviews.length === 0)return res.json({})

    const Reviews = reviews.map(review => {
        const spot = review.toJSON().Spot
        const preivewImage = spot.SpotImages ? spot.SpotImages[0].url:null
        const {id, ownerId, address, city, state, country, lat, lng, name, price} = spot
        return {...review.toJSON(), Spot: {id, ownerId, address, city, state, country, lat, lng, name, price, preivewImage}}
    })

    res.json({Reviews})
})

router.put('/:reviewId', requireAuth, async (req, res) => {

    const {review, stars} = req.body
    const errors = {}

    if(!review) errors.review = "Review text is required"
    if(!stars || stars > 5 || stars < 1) errors.review = "Stars must be an integer from 1 to 5"

    if(Object.keys(errors).length > 0) return res.status(400).json({message: "Bad Request", errors})

    const { reviewId } = req.params
    if(reviewId === "null")return res.status(404).json({message:'Cannot find review with id null'})
    const reviewToEdit = await Review.findOne({
        where:{
            id: reviewId
        }
    })

    if(!reviewToEdit)return res.status(404).json({message: "Review couldn't be found"})
    if(reviewToEdit.userId !== +req.user.id)return res.status(403).json({"message": "Forbidden"})

    if(!review)return res.status(400).json({errors:{review: "Review text is required"}})
    if(stars > 5 || stars < 1)return res.status(400).json({errors:{review: "Stars must be an integer from 1 to 5"}})

    await reviewToEdit.update({
        review,
        stars: stars || reviewToEdit.stars
    })

    return res.json({...reviewToEdit.toJSON()})
})

router.delete('/:reviewId', requireAuth, async (req, res) => {

    const reviewId = req.params.reviewId

    const reviewToDestroy = await Review.findOne({
        where: {
            id: reviewId
        }
    })
    if(!reviewToDestroy)return res.status(404).json({message: "Review couldn't be found"})
    if(reviewToDestroy.userId !== +req.user.id) return res.status(403).json({"message": "Forbidden"})


    await ReviewImage.destroy({
        where:{
            reviewId
        }
    })

    await reviewToDestroy.destroy()

    return res.json({"message": "Successfully deleted"})
})

module.exports = router;
