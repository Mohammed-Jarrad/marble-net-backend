const asyncHandler = require('express-async-handler')
const { Order } = require('../models/order')

/** ----------------------------------------------------------------
 * @desc Create a new order
 * @route /api/orders
 * @method POST
 * @access only logged in user himself
   -----------------------------------------------------------------
 */
module.exports.createOrder = asyncHandler(async (req, res) => {
	const { user, products, userPhone, shippingAddress, notes } = req.body
	if (req.user.id != user) {
		return res
			.status(403)
			.json({ message: "Access denied. Can't create order for another user. Only for you." })
	}
	const order = await Order.create({
		user,
		products,
		userPhone,
		shippingAddress,
		notes,
	})
	res.status(201).json(order)
})

/** ----------------------------------------------------------------
 * @desc Get a single order by ID
 * @route /api/orders/:id
 * @method GET
 * @access admin or employee or owner of the order
   -----------------------------------------------------------------
 */
module.exports.getOrderById = asyncHandler(async (req, res) => {
	const order = await Order.findById(req.params.id).populate([
		{ path: 'user', select: 'username email' },
		{ path: 'products.product' },
	])
	if (!order) {
		return res.status(404).json({ message: 'Order not found.' })
	}
	if (req.user.id === order.user.toString() || req.user.role == 'admin' || req.user.role == 'employee') {
		return res.status(200).json(order)
	}
	return res.status(403).json({ message: 'Access denied. Only owner or admin.' })
})

/** ----------------------------------------------------------------
 * @desc Get orders for a specific user
 * @route /api/orders/user/:id
 * @method GET
 * @access only logged in user himself or admin or employee
   -----------------------------------------------------------------
 */
module.exports.getOrdersForUser = asyncHandler(async (req, res) => {
	const userId = req.params.id
    if (req.user.id != userId && req.user.role != 'admin' && req.user.role != 'employee') {
		return res
			.status(403)
			.json({ message: "Access denied. Can't get orders for another user. Only for you." })
	}
	const { page = 1, limit = 10, status } = req.query
	const skip = (page - 1) * limit

	const filter = { user: userId }
	if (status) filter.status = status

	const orders = await Order.find(filter)
		.skip(skip)
		.limit(parseInt(limit))
		.sort({ createdAt: -1 })
		.populate('user', 'username email')
		.populate('products.product', 'price name')

	res.status(200).json(orders)
})

/** ----------------------------------------------------------------
 * @desc Update order status
 * @route /api/orders/update-status/:id
 * @method PUT
 * @access admin or employee
   -----------------------------------------------------------------
 */
module.exports.updateOrderStatus = asyncHandler(async (req, res) => {
	const { status } = req.body
	const order = await Order.findByIdAndUpdate(
		req.params.id,
		{
			$set: {
				status,
			},
		},
		{
			new: true,
			runValidators: true,
		},
	).populate([{ path: 'user', select: 'username email' }, { path: 'products.product' }])
	if (!order) {
		return res.status(404).json({ message: 'Order not found.' })
	}
	res.status(200).json(order)
})
/** ----------------------------------------------------------------
 * @desc Update order note
 * @route /api/orders/update-note/:id
 * @method PUT
 * @access admin or employee
   -----------------------------------------------------------------
 */
module.exports.updateOrderNote = asyncHandler(async (req, res) => {
	const { notes } = req.body
	const order = await Order.findByIdAndUpdate(
		req.params.id,
		{
			$set: {
				notes,
			},
		},
		{
			new: true,
			runValidators: true,
		},
	).populate([{ path: 'user', select: 'username email' }, { path: 'products.product' }])
	if (!order) {
		return res.status(404).json({ message: 'Order not found.' })
	}
	res.status(200).json(order)
})

/** ----------------------------------------------------------------
 * @desc Get all orders
 * @route /api/orders
 * @method GET
 * @access admin or employee
   -----------------------------------------------------------------
 */
module.exports.getAllOrders = asyncHandler(async (req, res) => {
	const { page = 1, limit = 10, status } = req.query
	const skip = (page - 1) * limit
	const filter = {}
	if (status) filter.status = status

	const orders = await Order.find(filter)
		.skip(skip)
		.limit(parseInt(limit))
		.sort({ createdAt: -1 })
		.populate('user', 'username email')
		.populate('products.product', 'price name')
	res.status(200).json(orders)
})
/** ----------------------------------------------------------------
 * @desc delete order
 * @route /api/orders/:id
 * @method DELETE
 * @access admin or employee
   -----------------------------------------------------------------
 */
module.exports.deleteOrder = asyncHandler(async (req, res) => {
	const { id } = req.params
	const order = await Order.findById(id)
	if (!order) {
		return res.status(404).json({ message: 'Order not found.' })
	}
	await Order.findByIdAndDelete(id)
	res.status(200).json({ message: 'Order deleted succesfully.' })
})
