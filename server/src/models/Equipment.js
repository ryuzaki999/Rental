module.exports = (sequelize, DataTypes) => {
  const Equipment = sequelize.define('Equipment', {
    name: DataTypes.STRING,
    sku: DataTypes.STRING,
    stock: { type: DataTypes.INTEGER, defaultValue: 0 },
    price: DataTypes.STRING,
    condition: DataTypes.STRING,
    status: DataTypes.STRING,
    description: DataTypes.TEXT
  })
  return Equipment
}
