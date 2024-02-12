const asyncHandler = require('express-async-handler')
const { Order } = require('../models/order')
const { Cart } = require('../models/cart')

/** ----------------------------------------------------------------
 * @desc Create a new order
 * @route /api/orders
 * @method POST
 * @access only logged in user himself
   -----------------------------------------------------------------
 */
module.exports.createOrder = asyncHandler(async (req, res) => {
	const { user, products, userPhone, shippingAddress, notes } = req.body
	if (req.user.id.toString() != user) {
		return res.status(403).json({ message: 'ممنوع الوصول. المستخدم يستطيع انشاء طلب لحسابه فقط.' })
	}
	const order = await Order.create({
		user,
		products,
		userPhone,
		shippingAddress,
		notes,
	})
	// clear the cart items after creating the order
	const cart = await Cart.findOne({ user })
	cart.items = []
	await cart.save()
	res.status(201).json({ order, cart, message: 'تم انشاء الطلب بنجاح.' })
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
		return res.status(404).json({ message: 'الطلب غير موجود.' })
	}
	if (req.user.id.toString() !== order.user._id.toString() && req.user.role !== 'admin' && req.user.role !== 'employee') {
		return res.status(403).json({ message: 'ممنوع الوصول. فقط صاحب الطلب او الادمن او الموظف.' })
	}
	res.status(200).json(order)
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
	if (req.user.id.toString() != userId && req.user.role != 'admin' && req.user.role != 'employee') {
		return res.status(403).json({ message: 'ممنوع الوصول. لا يمكن الحصول على طلبات المستخدمين الآخرين.' })
	}
	const { status } = req.query
	const filter = { user: userId }
	if (status) filter.status = status
	const orders = await Order.find(filter)
		.sort({ createdAt: -1 })
		.populate('user', 'username email')
		.populate('products.product', 'name source category image')

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
		return res.status(404).json({ message: 'الطلب غير موجود.' })
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
		return res.status(404).json({ message: 'الطلب غير موجود.' })
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
	const { status } = req.query
	const filter = {}
	if (status) filter.status = status

	const orders = await Order.find(filter)
		.sort({ createdAt: -1 })
		.populate('user', 'username email')
		.populate('products.product', 'name source category image')
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
		return res.status(404).json({ message: 'الطلب غير موجود.' })
	}
	await Order.findByIdAndDelete(id)
	res.status(200).json({ message: 'تم الحذف بنجاح.', orderId: id })
})
