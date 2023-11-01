const {
	createComment,
	updateComment,
	deleteComment,
	getAllComments,
	getCommentsCount,
	getCommentsForProduct,
} = require('../controllers/commentController')
const verifyObjectId = require('../middlewares/verifyObjectId')
const { verifyToken, verifyAdminOrEmployee } = require('../middlewares/verifyRole')

const router = require('express').Router()

// /api/comments/count
router.get('/count', verifyAdminOrEmployee, getCommentsCount)

// /api/comments/
router.route('/').post(verifyToken, createComment).get(verifyAdminOrEmployee, getAllComments)

// /api/comments/:id
router
	.route('/:id')
	.put(verifyObjectId, verifyToken, updateComment)
	.delete(verifyObjectId, verifyToken, deleteComment)

// /api/comments/product/:id
router.route('/product/:id').get(verifyObjectId, getCommentsForProduct)

module.exports = router
