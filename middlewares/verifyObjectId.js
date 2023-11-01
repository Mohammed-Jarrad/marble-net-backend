const mongoose = require('mongoose')

const verifyObjectId = (req, res, next) => {
	if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
		return res.status(400).json({ message: 'Invalid id.' })
	} else {
		next()
	}
}

module.exports = verifyObjectId
