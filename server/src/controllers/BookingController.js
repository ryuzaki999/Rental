const { Booking, Equipment, sequelize, User, Field, AuditLog } = require('../models')
const { Op } = require('sequelize')
const QRCode = require('qrcode')
const socket = require('../socket')

const bookingInclude = () => ([
  { model: User, attributes: ['id', 'email', 'name', 'lastname'] },
  { model: Field, attributes: ['id', 'name', 'location', 'image', 'sportType'] }
])

const canAccessBooking = (user, booking) => {
  if (!user || !booking) return false
  return user.role === 'admin' || user.id === booking.userId
}

const normalizeEquipmentItems = (items) => {
  if (!Array.isArray(items)) return []
  return items
    .map((it) => ({
      equipmentId: parseInt(it && it.equipmentId),
      qty: parseInt(it && it.qty)
    }))
    .filter((it) => Number.isInteger(it.equipmentId) && it.equipmentId > 0 && Number.isInteger(it.qty) && it.qty > 0)
}

const restockEquipmentItems = async (items, transaction) => {
  const normalized = normalizeEquipmentItems(items)
  for (const it of normalized) {
    const equipment = await Equipment.findByPk(it.equipmentId, { transaction, lock: transaction.LOCK.UPDATE })
    if (!equipment) continue
    equipment.stock = (parseInt(equipment.stock) || 0) + it.qty
    await equipment.save({ transaction })
  }
}

module.exports = {
  // list bookings for current user (protected route)
  async index (req, res) {
    try {
      const q = req.query
      const where = {}
      const include = bookingInclude()

      // if not admin or not asking for all, limit to current user
      const isAdmin = req.user && req.user.role === 'admin'
      if (!isAdmin || !q.all) {
        if (req.user) where.userId = req.user.id
      } else {
        // admin may filter by userId
        if (q.userId) where.userId = q.userId
      }

      if (q.fieldId) where.fieldId = q.fieldId
      if (q.status) where.status = q.status
      if (q.search) {
        include[1].where = {
          name: { [Op.like]: `%${q.search}%` }
        }
        include[1].required = true
      }

      // date range: return bookings overlapping [start,end]
      if (q.start && q.end) {
        const start = new Date(q.start)
        const end = new Date(q.end)
        if (!isNaN(start) && !isNaN(end)) {
          where[Op.and] = [
            { startTime: { [Op.lt]: end } },
            { endTime: { [Op.gt]: start } }
          ]
        }
      }

      const limit = q.limit ? parseInt(q.limit) : 50
      const offset = q.offset ? parseInt(q.offset) : 0

      const result = await Booking.findAndCountAll({
        where,
        include,
        order: [['id', 'DESC']],
        limit,
        offset
      })

      // return rows and count (rows include User and Field associations)
      res.send({ rows: result.rows, count: result.count })
    } catch (err) {
      console.error(err)
      res.status(500).send({ error: 'Could not fetch bookings' })
    }
  },
  // create booking with basic overlap check
  async create (req, res) {
    const t = await sequelize.transaction()
    try {
      const payload = Object.assign({}, req.body)
      if (req.user) payload.userId = req.user.id
      payload.fieldId = parseInt(payload.fieldId)
      if (!Number.isInteger(payload.fieldId) || payload.fieldId <= 0) {
        await t.rollback()
        return res.status(400).send({ error: 'Field is required' })
      }
      payload.equipmentItems = normalizeEquipmentItems(payload.equipmentItems)
      if (!payload.status) payload.status = 'pending-payment'

      const start = new Date(payload.startTime)
      const end = new Date(payload.endTime)
      if (isNaN(start) || isNaN(end) || end <= start) {
        await t.rollback()
        return res.status(400).send({ error: 'Invalid start or end time' })
      }

      // check overlapping bookings for same field
      const conflict = await Booking.findOne({
        where: {
          fieldId: payload.fieldId,
          status: { [Op.ne]: 'cancelled' },
          startTime: { [Op.lt]: end },
          endTime: { [Op.gt]: start }
        },
        transaction: t
      })
      if (conflict) {
        await t.rollback()
        return res.status(409).send({ error: 'Time slot is already booked' })
      }

      // handle equipment reservation (if provided)
      if (payload.equipmentItems.length) {
        for (const it of payload.equipmentItems) {
          const equipment = await Equipment.findByPk(it.equipmentId, { transaction: t, lock: t.LOCK })
          if (!equipment) {
            await t.rollback()
            return res.status(404).send({ error: `Equipment ${it.equipmentId} not found` })
          }
          const qty = parseInt(it.qty) || 0
          if (equipment.stock < qty) {
            await t.rollback()
            return res.status(409).send({ error: `Not enough stock for equipment ${equipment.name}` })
          }
          equipment.stock = equipment.stock - qty
          await equipment.save({ transaction: t })
        }
      }

      const booking = await Booking.create(payload, { transaction: t })
      await t.commit()
      // emit booking created to public and admin namespaces
      try {
        const io = socket.getIo()
        if (io) {
          io.emit('booking:created', booking)
          try { io.of('/admin').emit('booking:created', booking) } catch (e) {}
        }
      } catch (e) {}
      res.send(booking)
    } catch (err) {
      console.error(err)
      try { await t.rollback() } catch (e) {}
      res.status(500).send({ error: 'Create booking failed' })
    }
  },
  async show (req, res) {
    try {
      const booking = await Booking.findByPk(req.params.bookingId, {
        include: bookingInclude()
      })
      if (!booking) return res.status(404).send({ error: 'Booking not found' })
      if (!canAccessBooking(req.user, booking)) {
        return res.status(403).send({ error: 'you do not have access to this booking' })
      }
      res.send(booking)
    } catch (err) {
      console.error(err)
      res.status(500).send({ error: 'Could not fetch booking' })
    }
  },
  async qr (req, res) {
    try {
      const booking = await Booking.findByPk(req.params.bookingId)
      if (!booking) return res.status(404).send({ error: 'Booking not found' })
      if (!canAccessBooking(req.user, booking)) {
        return res.status(403).send({ error: 'you do not have access to this booking' })
      }
      // generate QR if not exists (data: booking id + token)
      if (!booking.qrCode) {
        const payload = JSON.stringify({ bookingId: booking.id, ts: Date.now() })
        const dataUrl = await QRCode.toDataURL(payload)
        booking.qrCode = dataUrl
        await booking.save()
      }
      res.send({ qrCode: booking.qrCode })
    } catch (err) {
      console.error(err)
      res.status(500).send({ error: 'Failed to generate QR' })
    }
  },
  async checkin (req, res) {
    try {
      const isAdmin = req.user && req.user.role === 'admin'
      if (!isAdmin) {
        return res.status(403).send({ error: 'only admin can check in booking' })
      }
      const booking = await Booking.findByPk(req.params.bookingId)
      if (!booking) return res.status(404).send({ error: 'Booking not found' })
      if (booking.checkedIn) return res.status(400).send({ error: 'Already checked in' })
      booking.checkedIn = true
      booking.status = 'checked-in'
      await booking.save()
      // create audit log for check-in
      try {
        await AuditLog.create({ actorId: req.user ? req.user.id : null, targetUserId: booking.userId, action: 'booking-checkin', details: `bookingId: ${booking.id}` })
        try { const io2 = socket.getIo(); if (io2) io2.of('/admin').emit('audit:created', { action: 'booking-checkin', bookingId: booking.id, actorId: req.user ? req.user.id : null }) } catch (e) {}
      } catch (e) { console.error('Audit failed', e) }
      try {
        const io = socket.getIo()
        if (io) {
          io.emit('booking:updated', booking)
          try { io.of('/admin').emit('booking:updated', booking) } catch (e) {}
        }
      } catch (e) {}
      res.send({ success: true, booking })
    } catch (err) {
      console.error(err)
      res.status(500).send({ error: 'Check-in failed' })
    }
  },

  // Confirm payment for a booking
  async confirmPayment (req, res) {
    try {
      const booking = await Booking.findByPk(req.params.bookingId);
      if (!booking) {
        return res.status(404).send({ error: 'Booking not found' });
      }
      if (!canAccessBooking(req.user, booking)) {
        return res.status(403).send({ error: 'you do not have access to this booking' })
      }

      // Update status and paid flag
      booking.status = 'confirmed';
      booking.paid = true;
      await booking.save();

      // Audit log
      try {
        await AuditLog.create({
          actorId: req.user ? req.user.id : null,
          targetUserId: booking.userId,
          action: 'booking-payment-confirmed',
          details: `Booking ID: ${booking.id}`
        });
        const ioAdmin = socket.getIo().of('/admin');
        if (ioAdmin) {
          ioAdmin.emit('audit:created', { action: 'booking-payment-confirmed', bookingId: booking.id });
        }
      } catch (e) {
        console.error('Audit log for payment confirmation failed', e);
      }

      // Socket event
      try {
        const io = socket.getIo();
        if (io) {
          io.emit('booking:updated', booking);
          io.of('/admin').emit('booking:updated', booking);
        }
      } catch (e) {
        console.error('Socket emit for payment confirmation failed', e);
      }

      res.send({ success: true, booking });
    } catch (err) {
      console.error('Payment confirmation failed:', err);
      res.status(500).send({ error: 'An error occurred during payment confirmation.' });
    }
  },

  async put (req, res) {
    const t = await sequelize.transaction()
    try {
      const isAdmin = req.user && req.user.role === 'admin'
      const existing = await Booking.findByPk(req.params.bookingId, { transaction: t, lock: t.LOCK.UPDATE })
      if (!existing) {
        await t.rollback()
        return res.status(404).send({ error: 'Booking not found' })
      }
      if (!canAccessBooking(req.user, existing)) {
        await t.rollback()
        return res.status(403).send({ error: 'you do not have access to this booking' })
      }

      const allowedFields = ['status', 'checkedIn', 'startTime', 'endTime', 'equipmentItems', 'totalPrice', 'paid']
      const updates = {}
      allowedFields.forEach((key) => {
        if (req.body[key] !== undefined) updates[key] = req.body[key]
      })
      if (Object.keys(updates).length === 0) {
        await t.rollback()
        return res.status(400).send({ error: 'No valid fields to update' })
      }

      if (!isAdmin && updates.checkedIn !== undefined) {
        await t.rollback()
        return res.status(403).send({ error: 'only admin can update check-in' })
      }
      if (!isAdmin && updates.status === 'checked-in') {
        await t.rollback()
        return res.status(403).send({ error: 'only admin can update checked-in status' })
      }

      if (updates.equipmentItems !== undefined) {
        updates.equipmentItems = normalizeEquipmentItems(updates.equipmentItems)
      }

      if (updates.status === 'cancelled' && existing.status !== 'cancelled') {
        await restockEquipmentItems(existing.equipmentItems, t)
      }

      await existing.update(updates, { transaction: t })
      await t.commit()

      try {
        const updated = await Booking.findByPk(req.params.bookingId)
        const io = socket.getIo()
        if (io) {
          io.emit('booking:updated', updated)
          try { io.of('/admin').emit('booking:updated', updated) } catch (e) {}
        }

        // audit: record status or checkin change
        try {
          const { AuditLog } = require('../models')
          const changes = []
          if (updates.status && updates.status !== existing.status) changes.push(`status: ${existing.status} -> ${updates.status}`)
          if (updates.checkedIn !== undefined && updates.checkedIn !== existing.checkedIn) changes.push(`checkedIn: ${existing.checkedIn} -> ${updates.checkedIn}`)
          if (changes.length) {
            await AuditLog.create({ actorId: req.user ? req.user.id : null, targetUserId: existing.userId, action: 'booking-update', details: changes.join('; ') })
            try { const io2 = socket.getIo(); if (io2) io2.of('/admin').emit('audit:created', { action: 'booking-update', details: changes.join('; ') }) } catch (e) {}
          }
        } catch (e) { console.error('Audit failed', e) }

      } catch (e) {}

      res.send(updates)
    } catch (err) {
      try { await t.rollback() } catch (e) {}
      console.error(err)
      res.status(500).send({ error: 'Update booking failed' })
    }
  },
  async delete (req, res) {
    const t = await sequelize.transaction()
    try {
      const booking = await Booking.findByPk(req.params.bookingId, { transaction: t, lock: t.LOCK.UPDATE })
      if (!booking) {
        await t.rollback()
        return res.status(404).send({ error: 'Booking not found' })
      }
      if (!canAccessBooking(req.user, booking)) {
        await t.rollback()
        return res.status(403).send({ error: 'you do not have access to this booking' })
      }
      if (booking.status !== 'cancelled') {
        await restockEquipmentItems(booking.equipmentItems, t)
      }
      await booking.destroy({ transaction: t })
      await t.commit()
      try {
        const io = socket.getIo()
        if (io) {
          io.emit('booking:deleted', { id: req.params.bookingId })
          try { io.of('/admin').emit('booking:deleted', { id: req.params.bookingId }) } catch (e) {}
        }
      } catch (e) {}

      try {
        const { AuditLog } = require('../models')
        await AuditLog.create({ actorId: req.user ? req.user.id : null, targetUserId: booking.userId, action: 'booking-delete', details: `bookingId: ${booking.id}` })
      } catch (e) { console.error('Audit failed', e) }

      res.send({ success: true })
    } catch (err) {
      try { await t.rollback() } catch (e) {}
      console.error(err)
      res.status(500).send({ error: 'Delete booking failed' })
    }
  }
}
