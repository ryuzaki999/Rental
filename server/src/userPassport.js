const passport = require('passport')
const { User } = require('./models')

const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt

const config = require('./config/config')

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.authentication.jwtSecret
    },
    async function (jwtPayload, done) {
      try {
        const user = await User.findOne({
          where: {
            email: jwtPayload.email
          }
        })

        if (!user) {
          return done(null, false)
        }

        return done(null, user)
      } catch (err) {
        console.error(err)
        return done(err, false)
      }
    }
  )
)

module.exports = null
