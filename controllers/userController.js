const asyncHandler = require('express-async-handler')
const { User } = require('../models/user')
const bcrypt = require('bcryptjs')
const { Order } = require('../models/order')
const { Rating } = require('../models/rating')
const { Comment } = require('../models/comment')
const { Cart } = require('../models/cart')

/** ----------------------------------------------------------------
 * @desc get all users
 * @route /api/users/profile
 * @method GET
 * @access admin or employee
   -----------------------------------------------------------------
 */
module.exports.getAllUsers = asyncHandler(async (req, res) => {
	const users = await User.find().select('-password').populate('cart')
	res.status(200).json(users)
})

/** ----------------------------------------------------------------
 * @desc get user profile
 * @route /api/users/profile/:id
 * @method GET
 * @access public
   -----------------------------------------------------------------
 */
module.exports.getUserProfile = asyncHandler(async (req, res) => {
	const user = await User.findById(req.params.id).select('-password')
	if (!user) {
		return res.status(404).json({ message: 'User not found.' })
	}
	res.status(200).json(user)
})

/** ----------------------------------------------------------------
 * @desc update user profile
 * @route /api/users/profile/:id
 * @method PUT
 * @access only user himself
   -----------------------------------------------------------------
 */
module.exports.updateUserPorfile = asyncHandler(async (req, res) => {
	const user = await User.findById(req.params.id)
	if (!user) {
		return res.status(404).json({ message: 'User not found.' })
	}
	if (req.body.password) {
		if (req.body.password.length < 6) {
			return res.status(400).json({ message: 'Password must be at least 6 characters long.' })
		}
		const salt = await bcrypt.genSalt(10)
		req.body.password = await bcrypt.hash(req.body.password, salt)
	}
	const updatedUser = await User.findByIdAndUpdate(
		req.params.id,
		{
			$set: {
				username: req.body.username,
				password: req.body.password,
			},
		},
		{
			new: true,
			runValidators: true,
		},
	).select('-password')
	res.status(200).json(updatedUser)
})

/** ----------------------------------------------------------------
 * @desc get users count
 * @route /api/users/count
 * @method GET
 * @access only admin or employee
   -----------------------------------------------------------------
 */
module.exports.getUsersCount = asyncHandler(async (req, res) => {
	const count = await User.count()
	res.status(200).json(count)
})

/** ----------------------------------------------------------------
 * @desc delete user profile
 * @route /api/users/profile/:id
 * @method delete
 * @access only admin or employee or user himself
   -----------------------------------------------------------------
 */
module.exports.deleteUserProfile = asyncHandler(async (req, res) => {
	const userId = req.params.id
	const user = await User.findById(userId)
	if (!user) {
		return res.status(404).json({ message: 'User not found.' })
	}
	const isAuthorized =
		req.user.role == 'admin' ||
		(user.role == 'employee' && req.user.role == 'employee' && req.user.id == userId) ||
		(user.role == 'customer' && req.user.role == 'employee') ||
		(user.role == 'customer' && req.user.role == 'customer' && req.user.id == userId)

	if (!isAuthorized) {
		return res.status(403).json({ message: 'Access denied.' })
	}
	const orders = await Order.find({ user: userId })
	if (orders.length > 0) {
		return res.status(400).json({ message: "Can't delete this user, This user has at least one order." })
	}
	await User.findByIdAndDelete(userId)
	await Comment.deleteMany({ user: userId })
	await Rating.deleteMany({ user: userId })
	await Cart.deleteMany({ user: userId })
	res.status(200).json({ userId, username: user.username, message: 'Deleted succesfully.' })
})

/** ----------------------------------------------------------------
 * @desc update user role
 * @route /api/users/update-role/:id
 * @method PUT
 * @access admin
   -----------------------------------------------------------------
 */
module.exports.changeUserRole = asyncHandler(async (req, res) => {
	const { role } = req.body
	const user = await User.findByIdAndUpdate(
		req.params.id,
		{
			$set: {
				role,
			},
		},
		{
			new: true,
			runValidators: true,
		},
	)
	if (!user) {
		return res.status(404).json({ message: 'User not found.' })
	}
	res.status(200).json({ user, message: 'User role changed succesfully.' })
})
