const { Review, User, Field } = require('../models')

module.exports = {
  // get all reviews for a specific field
  async index (req, res) {
    try {
      const { fieldId } = req.query
      if (!fieldId) {
        return res.status(400).send({ error: 'fieldId is required' })
      }

      const reviews = await Review.findAll({
        where: { fieldId: fieldId },
        include: [
          {
            model: User,
            attributes: ['id', 'name', 'lastname']
          }
        ],
        order: [['createdAt', 'DESC']]
      })

      res.send(reviews)
    } catch (err) {
      console.error(err)
      res.status(500).send({ error: 'Could not fetch reviews' })
    }
  },

  // create a new review
  async post (req, res) {
    try {
      const { fieldId, rating, comment } = req.body
      const userId = req.user.id

      // Optional: Check if the user has already reviewed this field
      const existingReview = await Review.findOne({
        where: {
          userId,
          fieldId
        }
      })

      if (existingReview) {
        return res.status(409).send({ error: 'You have already reviewed this field' })
      }

      const review = await Review.create({
        userId,
        fieldId,
        rating,
        comment
      })

      res.status(201).send(review)
    } catch (err) {
      console.error(err)
      res.status(500).send({ error: 'Create review failed' })
    }
  }
}
