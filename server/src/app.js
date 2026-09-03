const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const path = require('path')
const fs = require('fs')

function createApp() {
  const app = express()

  app.use(cors())
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: true }))

  // serve uploaded files from server/public (uploads saved there)
  app.use('/public', express.static(path.join(__dirname, '..', 'public')))

  require('./userPassport')

  // Mount all API routes under /api so they don't clash with the frontend's
  // client-side routes when both are served from the same server.
  const apiRouter = express.Router()
  require('./routes')(apiRouter)
  app.use('/api', apiRouter)

  // Serve the built frontend (client/dist) so a single server can host UI + API.
  const clientDist = path.join(__dirname, '..', '..', 'client', 'dist')
  const indexPath = path.join(clientDist, 'index.html')
  app.use(express.static(clientDist))

  // SPA fallback (history mode): return index.html for unmatched GET requests,
  // except for unknown /api/* routes which should return JSON 404.
  app.use((req, res) => {
    if (req.path === '/api' || req.path.startsWith('/api/')) {
      return res.status(404).json({ error: 'Not found' })
    }
    if (req.method === 'GET' && fs.existsSync(indexPath)) {
      return res.sendFile(indexPath)
    }
    if (req.method === 'GET') {
      return res.status(404).send('Frontend not built yet. Run: cd client && npm run build')
    }
    res.status(404).json({ error: 'Not found' })
  })

  return app
}

const app = createApp()

// Only start the HTTP server + socket when run directly (`node src/app.js`).
// When required by a test runner, export the app instead.
if (require.main === module) {
  const config = require('./config/config')
  const http = require('http')
  const server = http.createServer(app)
  const socket = require('./socket')
  socket.init(server)
  server.listen(config.port, () => {
    console.log(`Server started on port ${config.port}`)
  })
}

module.exports = app
