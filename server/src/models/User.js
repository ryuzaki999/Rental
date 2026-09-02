const bcrypt = require('bcrypt')

async function hashPassword (user) {
  if (!user.changed('password')) return

  const salt = await bcrypt.genSalt(10)
  const hash = await bcrypt.hash(user.password, salt)
  user.setDataValue('password', hash)
}

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    email: {
      type: DataTypes.STRING,
      unique: true
    },
    password: DataTypes.STRING,
    name: DataTypes.STRING,
    lastname: DataTypes.STRING,
    status: DataTypes.STRING,
    role: {
      type: DataTypes.STRING,
      defaultValue: 'user'
    }
  }, {
    hooks: {
      beforeCreate: hashPassword,
      beforeUpdate: hashPassword
    }
  })

  User.prototype.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password)
  }

  return User
}
