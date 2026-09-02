module.exports = {
  apps: [
    {
      name: 'rental-server',
      script: 'server/src/app.js',
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: 8081
      }
    },
    {
      name: 'rental-client',
      script: 'serve',
      args: 'client/dist --port 8080',
      interpreter: 'none',
      watch: false
    }
  ]
}
