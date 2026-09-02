module.exports = (sequelize, DataTypes) => {
  const Field = sequelize.define('Field', {
    name: DataTypes.STRING,
    sportType: DataTypes.STRING,
    location: DataTypes.STRING,
    price: DataTypes.STRING,
    capacity: DataTypes.INTEGER,
    description: DataTypes.TEXT,
    status: DataTypes.STRING,
    image: DataTypes.STRING,
    gallery: DataTypes.STRING
  })
  return Field
}
