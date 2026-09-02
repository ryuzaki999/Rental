const passport = require('passport')

module.exports = function (req, res, next) {
  passport.authenticate('jwt', function (err, user) {
    if (err || !user) {
      return res.status(403).send({ error: 'you do not have access to this resource' })
    }
    if (user.role !== 'admin') {
      return res.status(403).send({ error: 'admin only' })
    }
    req.user = user
    next()
  })(req, res, next)
}
