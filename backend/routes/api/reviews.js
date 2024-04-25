const express = require('express');
const { Review, Spot, ReviewImage } = require('../../db/models');

const router = express.Router()

router.post('/:reviewId/images', async (req, res) => {
    if(!req.user) return res.status(400).json({
        "message": "Authentication required"
      })

    const reviewId = +req.params.reviewId
    const {url} = req.body
    const review = await Review.findByPk(reviewId)
    if(!url)return res.json('Url cannot be null')
    if(!review)return res.status(404).json("Review couldn't be found")

    if(review.userId !== +req.user.id) return res.status(403).json({"message": "Forbidden"})

    const imgCount = await ReviewImage.count({
        where: {
            reviewId
        }
    })
    //potential issue here
    if(imgCount > 9)return res.status(403).json({"message": "Maximum number of images for this resource was reached"})

    const newImg = await ReviewImage.create({
        reviewId,
        url
    })

    res.json({id: newImg.id, url: newImg.url})
})

router.get('/current', async (req, res) => {
    if(!req.user) return res.status(400).json({
        "message": "Authentication required"
      })

    const userId = +req.user.id
    const where = {}
    where.userId = userId

    const reviews = await Review.findAll({
        where,
        include: [{
            model: Spot
        },{
            model: ReviewImage
        }]
    })

    if(reviews.length === 0)return res.json({message: 'You have no reviews'})

    res.json({Reviews: reviews})
})

router.put('/:reviewId', async (req, res) => {
    if(!req.user) return res.status(401).json({
        "message": "Authentication required"
      })
    const {review, stars} = req.body
    const { reviewId } = req.params
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

    return res.json({reviewToEdit})
})

//FOREIGN KEY CONSTRAINT FAILED need to delete all the imgs i think
router.delete('/:reviewId', async (req, res) => {
    if(!req.user) return res.status(401).json({
        "message": "Authentication required"
      })

    const reviewId = req.params.reviewId

    const reviewToDestroy = await Review.findOne({
        where: {
            id: reviewId
        }
    })
    if(reviewToDestroy.userId !== +req.user.id) return res.status(403).json({"message": "Forbidden"})
    if(!reviewToDestroy)return res.status(404).json({message: "Review couldn't be found"})


    await ReviewImage.destroy({
        where:{
            reviewId
        }
    })

    await reviewToDestroy.destroy()

    return res.json({"message": "Successfully deleted"})
})

module.exports = router;
