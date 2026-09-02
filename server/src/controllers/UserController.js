const { User, AuditLog } = require('../models')
const socket = require('../socket')
const { Op } = require('sequelize')
const bcrypt = require('bcrypt')

module.exports = {
  // ===============================
  // get all users
  // ===============================
  async index (req, res) {
    try {
      const users = await User.findAll()
      res.send(users)
    } catch (err) {
      console.error(err)
      res.status(500).send({
        error: 'The users information was incorrect'
      })
    }
  },

  // ===============================
  // create user (ADMIN)
  // ===============================
  async create (req, res) {
    try {
      // 👉 ถ้า admin สร้าง user ใหม่
      // 👉 ให้ hash password ด้วย (เพื่อความปลอดภัย)
      if (req.body.password) {
        req.body.password = await bcrypt.hash(req.body.password, 10)
      }

      const user = await User.create(req.body)
      res.send(user.toJSON())
    } catch (err) {
      console.error(err)
      res.status(500).send({
        error: err.message
      })
    }
  },

  // ===============================
  // update user
  // ===============================
  async put (req, res) {
    try {
      // 👉 ถ้ามีการแก้ password
      const target = await User.findByPk(req.params.userId)
      if (!target) return res.status(404).send({ error: 'User not found' })

      // Prevent demoting the last admin
      if (req.body.role && req.body.role !== 'admin' && target.role === 'admin') {
        // prevent self-demotion
        if (req.user && req.user.id === target.id) {
          return res.status(400).send({ error: 'Cannot demote yourself' })
        }
        const otherAdmins = await User.count({ where: { role: 'admin', id: { [Op.ne]: target.id } } })
        if (otherAdmins === 0) {
          return res.status(400).send({ error: 'Cannot remove last admin' })
        }
      }

      if (req.body.password) {
        req.body.password = await bcrypt.hash(req.body.password, 10)
      }

      await User.update(req.body, {
        where: {
          id: req.params.userId
        }
      })

      // record audit for role changes
      try {
        if (req.body.role && req.body.role !== target.role) {
          const audit = await AuditLog.create({
            actorId: req.user ? req.user.id : null,
            targetUserId: target.id,
            action: 'role-change',
            details: `role: ${target.role} -> ${req.body.role}`
          })
          try {
            const io = socket.getIo()
            if (io) io.of('/admin').emit('audit:created', { id: audit.id, action: audit.action, details: audit.details })
          } catch (e) { console.error('Emit audit failed', e) }
        }
      } catch (e) {
        console.error('Failed to write audit log', e)
      }

      res.send(req.body)
    } catch (err) {
      console.error(err)
      res.status(500).send({
        error: 'Update user incorrect'
      })
    }
  },

  // ===============================
  // delete user
  // ===============================
  async remove (req, res) {
    try {
      const user = await User.findOne({
        where: {
          id: req.params.userId
        }
      })

      if (!user) {
        return res.status(403).send({
          error: 'The user information was incorrect'
        })
      }

      await user.destroy()
      res.send(user)
    } catch (err) {
      console.error(err)
      res.status(500).send({
        error: 'The user information was incorrect'
      })
    }
  },

  // ===============================
  // get user by id
  // ===============================
  async show (req, res) {
    try {
      const user = await User.findByPk(req.params.userId)
      res.send(user)
    } catch (err) {
      console.error(err)
      res.status(500).send({
        error: 'The user information was incorrect'
      })
    }
  }
}
