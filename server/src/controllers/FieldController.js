const { Field, Booking, Review, Equipment, sequelize } = require('../models')
const { Op } = require('sequelize')
const path = require('path')
const fs = require('fs')

const sportAliases = {
  football: ['football', 'ฟุตบอล', 'ฟุตซอล'],
  badminton: ['badminton', 'แบดมินตัน'],
  basketball: ['basketball', 'บาสเกตบอล'],
  volleyball: ['volleyball', 'วอลเลย์บอล'],
  tennis: ['tennis', 'เทนนิส']
}

function normalizeSportType(value) {
  if (!value) return []
  const v = String(value).trim().toLowerCase()
  if (sportAliases[v]) return sportAliases[v]
  const matched = Object.values(sportAliases).find((arr) => arr.some((it) => it.toLowerCase() === v))
  if (matched) return matched
  return [String(value).trim()]
}

function removeUploadByPath (filePath) {
  if (!filePath || typeof filePath !== 'string') return
  const parts = filePath.split('/')
  const filename = parts[parts.length - 1]
  if (!filename) return
  const uploadDir = path.join(__dirname, '..', '..', 'public', 'uploads')
  const absolute = path.join(uploadDir, filename)
  if (fs.existsSync(absolute)) {
    try { fs.unlinkSync(absolute) } catch (e) {}
  }
}

module.exports = {
  // Get all fields
  async index (req, res) {
    try {
      const q = req.query
      const where = {}

      // search across name or description
      if (q.search) {
        where[Op.or] = [
          { name: { [Op.like]: `%${q.search}%` } },
          { description: { [Op.like]: `%${q.search}%` } }
        ]
      } else {
        if (q.name) where.name = { [Op.like]: `%${q.name}%` }
        if (q.description) where.description = { [Op.like]: `%${q.description}%` }
      }

      if (q.sportType) {
        const sportCandidates = normalizeSportType(q.sportType)
        where.sportType = { [Op.in]: sportCandidates }
      }
      if (q.location) where.location = { [Op.like]: `%${q.location}%` }

      // price range (price is stored as TEXT, so cast to numeric for correct comparison)
      if (q.min_price || q.max_price) {
        const priceCondition = {}
        const min = Number(q.min_price)
        const max = Number(q.max_price)
        if (q.min_price !== '' && q.min_price != null && !Number.isNaN(min)) priceCondition[Op.gte] = min
        if (q.max_price !== '' && q.max_price != null && !Number.isNaN(max)) priceCondition[Op.lte] = max
        if (Reflect.ownKeys(priceCondition).length) {
          where[Op.and] = (where[Op.and] || []).concat([
            sequelize.where(sequelize.cast(sequelize.col('price'), 'INTEGER'), priceCondition)
          ])
        }
      }

      const limit = q.limit ? parseInt(q.limit) : 12
      const offset = q.offset ? parseInt(q.offset) : 0

      const result = await Field.findAndCountAll({
        where,
        limit,
        offset,
        order: [['id', 'DESC']]
      })

      res.send({ rows: result.rows, count: result.count })
    } catch (err) {
      console.error(err)
      res.status(500).send({ error: 'The fields information was incorrect' })
    }
  },
  // availability: return bookings for field between start and end
  async availability (req, res) {
    try {
      const fieldId = req.params.fieldId
      const start = req.query.start ? new Date(req.query.start) : null
      const end = req.query.end ? new Date(req.query.end) : null
      const where = {
        fieldId,
        status: { [Op.ne]: 'cancelled' }
      }
      if (start && end) {
        // bookings that overlap range
        where[Op.and] = [
          { startTime: { [Op.lt]: end } },
          { endTime: { [Op.gt]: start } }
        ]
      }
      const bookings = await require('../models').Booking.findAll({ where, order: [['startTime', 'ASC']] })
      res.send(bookings)
    } catch (err) {
      console.error(err)
      res.status(500).send({ error: 'Could not fetch availability' })
    }
  },
  // Create field
  async create (req, res) {
    try {
      const payload = Object.assign({}, req.body)
      if (req.body.image) payload.image = req.body.image
      const field = await Field.create(payload)
      res.send(field.toJSON())
    } catch (err) {
      console.error(err)
      res.status(500).send({ error: 'Create field incorrect' })
    }
  },
  // Edit field
  async put (req, res) {
    try {
      await Field.update(req.body, {
        where: { id: req.params.fieldId }
      })
      res.send(req.body)
    } catch (err) {
      console.error(err)
      res.status(500).send({ error: 'Update field incorrect' })
    }
  },
  // Delete field
  async delete (req, res) {
    const t = await sequelize.transaction()
    try {
      const field = await Field.findOne({ where: { id: req.params.fieldId }, transaction: t, lock: t.LOCK.UPDATE })
      if (!field) {
        await t.rollback()
        return res.status(403).send({ error: 'The field information was incorrect' })
      }

      const bookings = await Booking.findAll({ where: { fieldId: req.params.fieldId }, transaction: t, lock: t.LOCK.UPDATE })
      for (const booking of bookings) {
        const items = Array.isArray(booking.equipmentItems) ? booking.equipmentItems : []
        for (const it of items) {
          const equipmentId = parseInt(it && it.equipmentId)
          const qty = parseInt(it && it.qty)
          if (!Number.isInteger(equipmentId) || equipmentId <= 0 || !Number.isInteger(qty) || qty <= 0) continue
          const equipment = await Equipment.findByPk(equipmentId, { transaction: t, lock: t.LOCK.UPDATE })
          if (!equipment) continue
          equipment.stock = (parseInt(equipment.stock) || 0) + qty
          await equipment.save({ transaction: t })
        }
      }

      await Booking.destroy({ where: { fieldId: req.params.fieldId }, transaction: t })
      if (Review) {
        await Review.destroy({ where: { fieldId: req.params.fieldId }, transaction: t })
      }
      const deletedField = field.toJSON()
      await field.destroy({ transaction: t })
      await t.commit()

      removeUploadByPath(deletedField.image)
      try {
        const gallery = deletedField.gallery
        const galleryItems = typeof gallery === 'string' ? JSON.parse(gallery) : gallery
        if (Array.isArray(galleryItems)) {
          galleryItems.forEach((img) => removeUploadByPath(img))
        }
      } catch (e) {}

      res.send(deletedField)
    } catch (err) {
      try { await t.rollback() } catch (e) {}
      console.error(err)
      res.status(500).send({ error: 'The field information was incorrect' })
    }
  },
  // Show field
  async show (req, res) {
    try {
      const field = await Field.findByPk(req.params.fieldId)
      res.send(field)
    } catch (err) {
      console.error(err)
      res.status(500).send({ error: 'The field information was incorrect' })
    }
  },
  // Upload an image file and return relative path (works on any host)
  async upload (req, res) {
    try {
      if (!req.file) return res.status(400).send({ error: 'No file uploaded' })
      const imagePath = '/public/uploads/' + req.file.filename
      res.send({ image: imagePath })
    } catch (err) {
      console.error(err)
      res.status(500).send({ error: 'Upload failed' })
    }
  }
}

// delete uploaded file by path
module.exports.deleteUpload = async function (req, res) {
  try {
    const filePath = req.body.path
    if (!filePath) return res.status(400).send({ error: 'No path provided' })
    const parts = filePath.split('/')
    const filename = parts[parts.length - 1]
    const uploadDir = path.join(__dirname, '..', '..', 'public', 'uploads')
    const absolute = path.join(uploadDir, filename)
    if (fs.existsSync(absolute)) {
      fs.unlinkSync(absolute)
      return res.send({ success: true })
    } else {
      return res.status(404).send({ error: 'File not found' })
    }
  } catch (err) {
    console.error(err)
    res.status(500).send({ error: 'Delete upload failed' })
  }
}
