module.exports = (sequelize, DataTypes) => {
  const Booking = sequelize.define('Booking', {
    userId: DataTypes.INTEGER,
    fieldId: DataTypes.INTEGER,
    startTime: DataTypes.DATE,
    endTime: DataTypes.DATE,
    equipmentItems: DataTypes.JSON,
    totalPrice: DataTypes.STRING,
    status: DataTypes.STRING,
    paid: { type: DataTypes.BOOLEAN, defaultValue: false },
    qrCode: DataTypes.TEXT,
    checkedIn: { type: DataTypes.BOOLEAN, defaultValue: false }
  })
  return Booking
}
