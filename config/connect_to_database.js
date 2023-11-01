const mongoose = require('mongoose')

module.exports = async () => {
	try {
		await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
        console.log('Connected Done!')
	} catch (error) {
        console.log('Connection Failed!', error)
    }
}
