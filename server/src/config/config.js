const path = require('path')

module.exports = {
  port: process.env.PORT || 8081,

  db: {
    database: 'coffeeshop-db',
    user: 'root',
    password: 'root',
    options: {
      dialect: 'sqlite',
      // lock to server/coffeeshop-db.sqlite regardless current working directory
      storage: path.resolve(__dirname, '..', '..', 'coffeeshop-db.sqlite'),
      logging: false
    }
  },

  authentication: {
    jwtSecret: process.env.JWT_SECRET || 'secret'
  }
}
