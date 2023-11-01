require('dotenv').config({
	path: process.env.NODE_ENV.trim() == 'production' ? '.env.production' : '.env.development',
})
const express = require('express')
const connect_to_database = require('./config/connect_to_database')
const cors = require('cors')
const { notFound, errorHandler } = require('./middlewares/error')
const authRoutes = require('./routes/authRoutes.js')
const userRoutes = require('./routes/userRoutes.js')
const productRoutes = require('./routes/productRoutes')
const commentRoutes = require('./routes/commentRoutes')
const ratingRoutes = require('./routes/ratingRoutes')
const orderRoutes = require('./routes/orderRoutes')
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
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/products', productRoutes)
app.use('/api/comments', commentRoutes)
app.use('/api/ratings', ratingRoutes)
app.use('/api/orders', orderRoutes)

// not found routes error handler
app.use(notFound)
// all other error handler (ValidationError or Internal Server Errors)
app.use(errorHandler)

app.listen(process.env.PORT || 4040, () => {
	if (process.env.NODE_ENV.trim() == 'production') console.log('Server is running')
	else console.log(`Server is running on http://localhost:${process.env.PORT}`)
})
