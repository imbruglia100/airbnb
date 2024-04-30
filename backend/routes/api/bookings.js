const express = require('express');
const { Booking, Spot, User } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');
const booking = require('../../db/models/booking');
const { Op } = require('sequelize')

const router = express.Router()

router.get('/current', requireAuth, async (req, res) => {
    const bookings = await Booking.findAll({
        where: {
            userId: +req.user.id
        },
        include: Spot
    })
    if(bookings.length === 0)res.json({message: 'No bookings found :('})
    return res.json({bookings})
})

router.put('/:bookingId', requireAuth, async (req, res) => {
    const { bookingId } = req.params
    const { startDate, endDate } = req.body

    let errors = {}

    if(Date.parse(startDate) < Date.now()) errors.startDate = "startDate cannot be in the past"
    if(Date.parse(startDate) >= Date.parse(endDate)) errors.endDate = "endDate cannot be on or before startDate"
    if(Object.keys(errors) > 0)return res.status(400).json({message: "Bad request", errors})

    if(Date.parse(endDate) < Date.now())return res.status(403).json({message: "Past bookings cannot be modified"})

    const booking = await Booking.findOne({
        where: {
            id: +bookingId
        }
    })
    if(!booking) return res.status(404).json({message: "Booking cannot be found"})
    if(+req.user.id !== booking.userId) return res.status(400).json({message: 'You are not the owner of this booking.'})

    const overLappingBooking = await Booking.findOne({
        spotId: booking.spotId,
        where: {
            endDate: {
                [Op.gt]: this.startDate
            },
            startDate: {
                [Op.lt]: this.endDate
            }
        }
    })

    if(overLappingBooking)return res.status(403).json({
        "message": "Sorry, this spot is already booked for the specified dates",
        "errors": {
          Overbooked: "This spot time is already taken"
        }
      })

    booking.set({
        startDate,
        endDate
    })

    await booking.save()

    return res.json(booking)
})

router.delete('/:bookingId', requireAuth, async (req, res) => {

    const bookingToDelete = await Booking.findOne({
        where:{
            id: +req.params.bookingId
        }
    })

    if(!bookingToDelete) return res.status(404).json({message: "Booking couldn't be found"})

    if(bookingToDelete.userId !== +req.user.id) return res.status(400).json('You are not the owner of this booking')

    if(Date.now() > Date.parse(bookingToDelete.startDate)) return res.status(403).json({message: "Bookings that have been started cannot be deleted."})

    await bookingToDelete.destroy()

    return res.json({
        message: "Successfully deleted"
    })
})

module.exports = router;
