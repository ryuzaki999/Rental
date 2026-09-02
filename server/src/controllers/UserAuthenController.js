const { User } = require('../models')
const jwt = require('jsonwebtoken')
const config = require('../config/config')

module.exports = {
  async register (req, res) {
    try {
      const { email } = req.body

      const existingUser = await User.findOne({ where: { email } })
      if (existingUser) {
        return res.status(400).send({ error: 'Email already exists' })
      }

      // ✅ ส่ง password plain → ให้ Model hash
      const user = await User.create(req.body)

      const created = user.toJSON()
      delete created.password
      res.send(created)
    } catch (err) {
      console.error(err)
      res.status(500).send({ error: 'Register failed' })
    }
  },

  async login (req, res) {
    try {
      const { email, password } = req.body

      const user = await User.findOne({ where: { email } })
      if (!user) {
        return res.status(403).send({ error: 'User/Password not correct' })
      }

      const isPasswordValid = await user.comparePassword(password)
      if (!isPasswordValid) {
        return res.status(403).send({ error: 'User/Password not correct' })
      }

      const userJSON = user.toJSON()
      delete userJSON.password

      const token = jwt.sign(
        userJSON,
        config.authentication.jwtSecret,
        { expiresIn: 60 * 60 * 24 * 7 } // 7 วัน
      )

      res.send({ user: userJSON, token })
    } catch (err) {
      console.error(err)
      res.status(500).send({ error: 'Login failed' })
    }
  }
}
