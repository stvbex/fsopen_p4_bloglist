const config = require('./utils/config')
const http = require('http')
const app = require('./app')
const logger = require('./utils/logger')

// TODO: http not required?
const server = http.createServer(app)

server.listen(config.PORT, () => {
    logger.info(`Server running on port ${config.PORT}`)
})