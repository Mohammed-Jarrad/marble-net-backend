const {
	createRate,
	deleteRate,
	getAllRatings,
	getRatingsForProduct,
} = require('../controllers/ratingConroller')
const verifyObjectId = require('../middlewares/verifyObjectId')
const { verifyToken, verifyAdminOrEmployee } = require('../middlewares/verifyRole')

const router = require('express').Router()

// /api/ratings/
router.route('/')
.post(verifyToken, createRate)
.get(verifyAdminOrEmployee, getAllRatings)

// /api/ratings/:id
router.route('/:id').delete(verifyObjectId, verifyToken, deleteRate)

// /api/ratings/product/:id
router.route('/product/:id').get(verifyObjectId, getRatingsForProduct)

module.exports = router
