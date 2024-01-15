const asyncHandler = require('express-async-handler');
const { User } = require('../models/user');
const bcrypt = require('bcryptjs');
const { Order } = require('../models/order');
const { Rating } = require('../models/rating');
const { Comment } = require('../models/comment');
const { Cart } = require('../models/cart');

/** ----------------------------------------------------------------
 * @desc get all users
 * @route /api/users/profile
 * @method GET
 * @access admin or employee
   -----------------------------------------------------------------
 */
module.exports.getAllUsers = asyncHandler(async (req, res) => {
	const users = await User.find().select('-password').populate('cart');
	res.status(200).json(users);
});

/** ----------------------------------------------------------------
 * @desc get user profile
 * @route /api/users/profile/:id
 * @method GET
 * @access public
   -----------------------------------------------------------------
 */
module.exports.getUserProfile = asyncHandler(async (req, res) => {
	const user = await User.findById(req.params.id).select('-password');
	if (!user) {
		return res.status(404).json({ message: 'المستخدم غير موجود.' });
	}
	res.status(200).json(user);
});

/** ----------------------------------------------------------------
 * @desc update user profile
 * @route /api/users/profile/:id
 * @method PUT
 * @access only user himself
   -----------------------------------------------------------------
 */
module.exports.updateUserPorfile = asyncHandler(async (req, res) => {
	const user = await User.findById(req.params.id);
	if (!user) {
		return res.status(404).json({ message: 'المستخدم غير موجود.' });
	}
	let updatedUser;
	if (req.body.password) {
		if (req.body.password.length < 6) {
			return res.status(400).json({ message: 'كلمة المرور يجب ان تكون 6 حروف على الاقل.' });
		}
		const salt = await bcrypt.genSalt(10);
		req.body.password = await bcrypt.hash(req.body.password, salt);
		updatedUser = await User.findByIdAndUpdate(
			req.params.id,
			{
				$set: {
					username: req.body.username,
					password: req.body.password,
					email: req.body.email,
				},
			},
			{
				new: true,
				runValidators: true,
			},
		).select('-password');
	} else {
		updatedUser = await User.findByIdAndUpdate(
			req.params.id,
			{
				$set: {
					username: req.body.username,
					email: req.body.email,
				},
			},
			{
				new: true,
				runValidators: true,
			},
		).select('-password');
	}
	res.status(200).json({ user: updatedUser, message: 'تم تعديل معلومات المستخدم بنجاح.' });
});

/** ----------------------------------------------------------------
 * @desc get users count
 * @route /api/users/count
 * @method GET
 * @access only admin or employee
   -----------------------------------------------------------------
 */
module.exports.getUsersCount = asyncHandler(async (req, res) => {
	const count = await User.count();
	res.status(200).json(count);
});

/** ----------------------------------------------------------------
 * @desc delete user profile
 * @route /api/users/profile/:id
 * @method delete
 * @access only admin or employee or user himself
   -----------------------------------------------------------------
 */
module.exports.deleteUserProfile = asyncHandler(async (req, res) => {
	const userId = req.params.id;
	const user = await User.findById(userId);
	if (!user) {
		return res.status(404).json({ message: 'المستخدم غير موجود.' });
	}
	const isAuthorized =
		req.user.role == 'admin' ||
		(user.role == 'employee' && req.user.role == 'employee' && req.user.id.toString() == userId) ||
		(user.role == 'customer' && req.user.role == 'employee') ||
		(user.role == 'customer' && req.user.role == 'customer' && req.user.id.toString() == userId);

	if (!isAuthorized) {
		return res.status(403).json({ message: 'ممنوع الوصول.' });
	}
	await User.findByIdAndDelete(userId);
	await Comment.deleteMany({ user: userId });
	await Rating.deleteMany({ user: userId });
	await Cart.deleteMany({ user: userId });
	await Order.deleteMany({ user: userId }); // new
	res.status(200).json({ userId, username: user.username, message: 'تم الحذف بنجاح.' });
});

/** ----------------------------------------------------------------
 * @desc update user role
 * @route /api/users/update-role/:id
 * @method PUT
 * @access admin
   -----------------------------------------------------------------
 */
module.exports.changeUserRole = asyncHandler(async (req, res) => {
	const { role } = req.body;
	const { id: targetUserId } = req.params;
	const user = await User.findByIdAndUpdate(
		targetUserId,
		{
			$set: {
				role,
			},
		},
		{
			new: true,
			runValidators: true,
		},
	);
	if (!user) {
		return res.status(404).json({ message: 'المستخدم غير موجود.' });
	}
	res.status(200).json({ user, message: 'تم تعديل حالة المستخدم.' });
});
