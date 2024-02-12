const {
	createOrder,
	getOrderById,
	getOrdersForUser,
	updateOrderStatus,
	getAllOrders,
	deleteOrder,
	updateOrderNote,
} = require('../controllers/orderController')
const verifyObjectId = require('../middlewares/verifyObjectId')
const { verifyToken, verifyAdminOrEmployee } = require('../middlewares/verifyRole')

const router = require('express').Router()

// /api/orders
router.route('/').post(verifyToken, createOrder).get(verifyAdminOrEmployee, getAllOrders)

// /api/orders/:id
router
	.route('/:id')
	.get(verifyObjectId, verifyToken, getOrderById)
	.delete(verifyObjectId, verifyAdminOrEmployee, deleteOrder)

// /api/orders/user/:id
router.route('/user/:id').get(verifyObjectId, verifyToken, getOrdersForUser)

// /api/orders/update-status/:id
router.route('/update-status/:id').put(verifyObjectId, verifyAdminOrEmployee, updateOrderStatus)

// /api/orders/update-note/:id
router.route('/update-note/:id').put(verifyObjectId, verifyAdminOrEmployee, updateOrderNote)

module.exports = router
