module.exports = (sequelize, DataTypes) => {
  const AuditLog = sequelize.define('AuditLog', {
    actorId: DataTypes.INTEGER,
    targetUserId: DataTypes.INTEGER,
    action: DataTypes.STRING,
    details: DataTypes.TEXT
  })

  return AuditLog
}
