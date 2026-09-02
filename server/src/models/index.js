const fs = require('fs')
const path = require('path')
const Sequelize = require('sequelize')
const config = require('../config/config')
const db = {}

const sequelize = new Sequelize(
    config.db.database,
    config.db.user,
    config.db.password,    config.db.options
)

// โหลดไฟล์ Model ทั้งหมดในโฟลเดอร์นี้อัตโนมัติ
fs.readdirSync(__dirname)
    .filter((file) => {
        return (file.indexOf('.') !== 0) && (file !== 'index.js')
    })
    .forEach((file) => {
        // วิธีเรียกใช้ Model แบบใหม่ (Modern Sequelize)
        const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes)
        db[model.name] = model
    })

db.sequelize = sequelize
db.Sequelize = Sequelize

// define associations
try {
    if (db.Booking && db.User) {
        db.Booking.belongsTo(db.User, { foreignKey: 'userId' })
        db.User.hasMany(db.Booking, { foreignKey: 'userId' })
    }
    if (db.Booking && db.Field) {
        db.Booking.belongsTo(db.Field, { foreignKey: 'fieldId' })
        db.Field.hasMany(db.Booking, { foreignKey: 'fieldId' })
    }
    if (db.Review && db.User) {
        db.Review.belongsTo(db.User, { foreignKey: 'userId' })
        db.User.hasMany(db.Review, { foreignKey: 'userId' })
    }
    if (db.Review && db.Field) {
        db.Review.belongsTo(db.Field, { foreignKey: 'fieldId' })
        db.Field.hasMany(db.Review, { foreignKey: 'fieldId' })
    }
} catch (e) { console.error('Association setup failed', e) }

// Keep startup stable: avoid automatic ALTER migrations on every boot.
// Use explicit migrations/seed when schema changes are needed.
sequelize.sync().catch((err) => {
    console.error('Sequelize sync failed', err)
})

module.exports = db
