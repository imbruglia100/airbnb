const express = require('express');
const { ReviewImage, Review } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');

const router = express.Router()

router.delete('/:imageId', requireAuth, async (req, res) => {
    const reviewImg = await ReviewImage.findOne({
        where: {
            id: +req.params.imageId
        }
    })

    if(!reviewImg) return res.status(404).json({message: "Review Image couldn't be found"})

    const review = await Review.findOne({
        where: {
            id: +reviewImg.reviewId
        }
    })

    if(review.userId !== +req.user.id)return res.status(403).json({message: "You are not the owner of this review"})

    await reviewImg.destroy()

    return res.json({
        "message": "Successfully deleted"
      })
})


module.exports = router;
