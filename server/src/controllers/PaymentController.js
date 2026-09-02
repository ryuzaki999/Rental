// Mock payment controller — returns a mock payment URL and status
const { Booking } = require('../models')

module.exports = {
  // create mock payment for booking
  async create (req, res) {
    try {
      const { bookingId, method } = req.body
      const booking = await Booking.findByPk(bookingId)
      if (!booking) return res.status(404).send({ error: 'Booking not found' })
      // mock payment url (in real app integrate gateway)
      const paymentUrl = `https://pay.example.com/mockpay?booking=${bookingId}&method=${method || 'promptpay'}`
      res.send({ paymentUrl, status: 'pending' })
    } catch (err) {
      console.error(err)
      res.status(500).send({ error: 'Create payment failed' })
    }
  },
  // simple status check
  async status (req, res) {
    try {
      const { bookingId } = req.params
      // in mock, always return unpaid
      res.send({ bookingId, status: 'pending' })
    } catch (err) {
      console.error(err)
      res.status(500).send({ error: 'Payment status failed' })
    }
  }
}
