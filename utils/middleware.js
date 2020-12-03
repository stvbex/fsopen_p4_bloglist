const logger = require('./logger')

const tokenExtractor = (req, res, next) => {
    const auth = req.headers.authorization // or req.get('authorization')
    if (auth && auth.toLowerCase().startsWith('bearer ')) {
        req.token = auth.substring(7)
        // MAYBE: delete req.headers.authorization
    }

    next()
}

const errorHandler = (error, request, response, next) => {
    logger.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    } 
    else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }

    next(error)
}

module.exports = {
    errorHandler,
    tokenExtractor
}