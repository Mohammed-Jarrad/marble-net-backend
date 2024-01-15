require('dotenv').config({
	path: process.env.NODE_ENV == 'production' ? '.env.production' : '.env.development',
})
const express = require('express')
const connect_to_database = require('./config/connect_to_database')
const cors = require('cors')
const { notFound, errorHandler } = require('./middlewares/error')
const { welcomePage } = require('./utils/welcomePage')

// connect to database
connect_to_database()

// setup
const app = express()
app.use(express.json())
app.use(
	cors({
		origin: process.env.CLIENT_DOMAIN,
		optionsSuccessStatus: 200,
	}),
)

app.get(['/', '/api'], (req, res) => {
	res.send(welcomePage)
})

// routes
app.use('/api/auth', require('./routes/authRoutes'))
app.use('/api/users', require('./routes/userRoutes'))
app.use('/api/products', require('./routes/productRoutes'))
app.use('/api/comments', require('./routes/commentRoutes'))
app.use('/api/ratings', require('./routes/ratingRoutes'))
app.use('/api/orders', require('./routes/orderRoutes'))
app.use('/api/carts', require('./routes/cartRoutes'))
app.use('/api/clients', require('./routes/clientRoutes'))

// not found routes error handler
app.use(notFound)
// all other error handler (ValidationError or Internal Server Errors)
app.use(errorHandler)

app.listen(process.env.PORT || 4040, () => {
	if (process.env.NODE_ENV == 'production') console.log('Server is running')
	else console.log(`Server is running on http://localhost:${process.env.PORT}`)
})
