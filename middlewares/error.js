const notFound = (req, res, next) => {
    const error = new Error(`This endpoint not found '${req.originalUrl}'`)
    res.status(404)
    next(error)
}

const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode == 200 ? 500 : res.statusCode
    res.status(statusCode)
    // handle validation errors
    if (err.name == 'ValidationError') {
        const errors = Object.values(err.errors).map(val => val.message)
        const errorMessage = errors.join(', ')
        return res.json({
            message: errorMessage,
        })
    }
    // handle unique errors
    if(err.name == 'MongoServerError' && err.code == 11000) {
        const key = Object.keys(err.keyValue)[0]
        const value = err.keyValue[key]
        const errorMessage = `${key.charAt(0).toUpperCase() + key.slice(1)} '${value}' already exist.`
        return res.json({
            message: errorMessage,
        })
    }
    // handle all other errors
    return res.json({
        message: err.message,
        stack: process.env.NODE_ENV == 'production' ? null : err.stack
    })
}

module.exports = {
    notFound,
    errorHandler
}