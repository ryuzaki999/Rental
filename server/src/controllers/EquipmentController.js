const { Equipment } = require('../models')

module.exports = {
  async index (req, res) {
    try {
      const q = req.query
      const where = {}
      if (q.name) where.name = { [require('sequelize').Op.like]: `%${q.name}%` }
      const rows = await Equipment.findAll({ where, order: [['id', 'DESC']] })
      res.send(rows)
    } catch (err) {
      console.error(err)
      res.status(500).send({ error: 'Could not fetch equipment' })
    }
  },
  async create (req, res) {
    try {
      const payload = Object.assign({}, req.body)
      const equipment = await Equipment.create(payload)
      res.send(equipment)
    } catch (err) {
      console.error(err)
      res.status(500).send({ error: 'Create equipment failed' })
    }
  },
  async show (req, res) {
    try {
      const equipment = await Equipment.findByPk(req.params.equipmentId)
      res.send(equipment)
    } catch (err) {
      console.error(err)
      res.status(500).send({ error: 'Could not fetch equipment' })
    }
  },
  async put (req, res) {
    try {
      await Equipment.update(req.body, { where: { id: req.params.equipmentId } })
      res.send(req.body)
    } catch (err) {
      console.error(err)
      res.status(500).send({ error: 'Update equipment failed' })
    }
  },
  async delete (req, res) {
    try {
      const equipment = await Equipment.findByPk(req.params.equipmentId)
      if (!equipment) return res.status(404).send({ error: 'Equipment not found' })
      await equipment.destroy()
      res.send({ success: true })
    } catch (err) {
      console.error(err)
      res.status(500).send({ error: 'Delete equipment failed' })
    }
  },
  // adjust stock: { delta: -1 or +5 }
  async adjustStock (req, res) {
    try {
      const delta = parseInt(req.body.delta)
      const equipment = await Equipment.findByPk(req.params.equipmentId)
      if (!equipment) return res.status(404).send({ error: 'Equipment not found' })
      const before = equipment.stock || 0
      equipment.stock = Math.max(0, (equipment.stock || 0) + delta)
      await equipment.save()

      // audit log for stock change
      try {
        const { AuditLog } = require('../models')
        const audit = await AuditLog.create({ actorId: req.user ? req.user.id : null, targetUserId: null, action: 'equipment-stock', details: `equipmentId:${equipment.id} ${before} -> ${equipment.stock}` })
        try {
          const socket = require('../socket')
          const io = socket.getIo()
          if (io) io.of('/admin').emit('audit:created', { id: audit.id, action: audit.action, details: audit.details })
        } catch (e) { console.error('Emit audit failed', e) }
      } catch (e) { console.error('Audit failed', e) }

      res.send(equipment)
    } catch (err) {
      console.error(err)
      res.status(500).send({ error: 'Adjust stock failed' })
    }
  }
}
