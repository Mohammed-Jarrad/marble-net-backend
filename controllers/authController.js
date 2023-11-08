const asyncHandler = require('express-async-handler')
const bcrypt = require('bcryptjs')
const { User } = require('../models/user')
const { Cart } = require('../models/cart')

/** ----------------------------------------------------------------
 * @desc Register New User - Sign Up
 * @route /api/auth/register
 * @method POST
 * @access public
   -----------------------------------------------------------------
 */
module.exports.registerController = asyncHandler(async (req, res, next) => {
	const { username, password, email } = req.body
	const user = await User.create({
		username, 
		email,
		password
	})
	const salt = await bcrypt.genSalt(10)
	const hashedPassword = await bcrypt.hash(password, salt)
	user.password = hashedPassword
	await user.save()
	const cart = await Cart.create({ user: user._id, items: [] })
	user.cart = cart._id
	await user.save()
	return res.status(201).json({ message: 'Your account has been created succesfully.' })
})
/** ----------------------------------------------------------------
 * @desc Log In User
 * @route /api/auth/login
 * @method POST
 * @access public
   -----------------------------------------------------------------
 */
module.exports.loginController = asyncHandler(async (req, res) => {
	const { password, email } = req.body
	let user = await User.findOne({ email })
	if (!user) return res.status(400).json({ message: 'Invalid email.' })
	const isCorrectPassword = await bcrypt.compare(password, user.password)
	if (!isCorrectPassword) return res.status(400).json({ message: 'Invalid password.' })

	const token = user.generateAuthToken()
	return res.status(200).json({
		_id: user._id,
		username: user.username,
		role: user.role,
		token,
		cart: user.cart,
	})
})
