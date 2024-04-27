const express = require('express');
const { Booking, Spot, User } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');

const router = express.Router()

router.get('/current', requireAuth, async (req, res) => {
    const bookings = await Booking.findAll({
        where: {
            userId: +req.user.id
        },
        include: Spot
    })

    return res.json({bookings})
})



module.exports = router;
