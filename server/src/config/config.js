const path = require('path')
const crypto = require('crypto')

const jwtSecret = process.env.JWT_SECRET

// Never allow a predictable secret in production.
if (!jwtSecret && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET environment variable is required in production')
}

module.exports = {
  port: process.env.PORT || 8081,

  db: {
    database: 'coffeeshop-db',
    user: 'root',
    password: 'root',
    options: {
      dialect: 'sqlite',
      // DB_PATH lets tests point at an isolated database.
      // Otherwise lock to server/coffeeshop-db.sqlite regardless of CWD.
      storage: process.env.DB_PATH || path.resolve(__dirname, '..', '..', 'coffeeshop-db.sqlite'),
      logging: false
    }
  },

  authentication: {
    // Random per-process secret for local dev when JWT_SECRET is unset, so we
    // never ship the old hard-coded 'secret' default.
    jwtSecret: jwtSecret || crypto.randomBytes(48).toString('hex')
  }
}

if (!jwtSecret) {
  console.warn('[config] JWT_SECRET not set — using a random per-process secret. Set JWT_SECRET for stable sessions.')
}
