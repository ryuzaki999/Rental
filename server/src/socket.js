let io = null

module.exports = {
  init: (server) => {
    const { Server } = require('socket.io')
    const jwt = require('jsonwebtoken')
    const config = require('./config/config')

    io = new Server(server, { cors: { origin: '*' } })

    // default namespace (public)
    io.on('connection', (socket) => {
      console.log('Socket connected (public):', socket.id)
      socket.on('disconnect', () => console.log('Socket disconnected (public):', socket.id))
    })

    // admin namespace: requires JWT token with role='admin'
    const adminNs = io.of('/admin')
    adminNs.use((socket, next) => {
      try {
        const token = socket.handshake && socket.handshake.auth && socket.handshake.auth.token
        if (!token) return next(new Error('Authentication error'))
        const decoded = jwt.verify(token, config.authentication.jwtSecret)
        if (!decoded || decoded.role !== 'admin') return next(new Error('Not authorized'))
        socket.user = decoded
        next()
      } catch (err) {
        next(new Error('Authentication error'))
      }
    })

    adminNs.on('connection', (socket) => {
      console.log('Admin socket connected:', socket.id, 'user:', socket.user && socket.user.email)
      socket.on('disconnect', () => console.log('Admin socket disconnected:', socket.id))
    })

    return io
  },
  getIo: () => io
}
