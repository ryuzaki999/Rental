const { AuditLog, User } = require('../models')

module.exports = {
  async index (req, res) {
    try {
      const logs = await AuditLog.findAll({ order: [['createdAt', 'DESC']], limit: 200 })

      // enrich with actor and target emails
      const ids = new Set()
      logs.forEach(l => { if (l.actorId) ids.add(l.actorId); if (l.targetUserId) ids.add(l.targetUserId) })
      const idList = Array.from(ids)
      const users = idList.length ? await User.findAll({ where: { id: idList } }) : []
      const map = {}
      users.forEach(u => { map[u.id] = u.email })

      const enriched = logs.map(l => ({
        id: l.id,
        actorId: l.actorId,
        actorEmail: l.actorId ? map[l.actorId] : null,
        targetUserId: l.targetUserId,
        targetEmail: l.targetUserId ? map[l.targetUserId] : null,
        action: l.action,
        details: l.details,
        createdAt: l.createdAt
      }))

      res.send(enriched)
    } catch (err) {
      console.error(err)
      res.status(500).send({ error: 'Could not fetch audit logs' })
    }
  }
}
