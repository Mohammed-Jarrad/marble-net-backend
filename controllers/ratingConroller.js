const asyncHandler = require('express-async-handler')
const { Rating } = require('../models/rating')

/** ----------------------------------------------------------------
 * @desc create rate
 * @route /api/ratings/
 * @method POST
 * @access only logged in user himself
   -----------------------------------------------------------------
 */
module.exports.createRate = asyncHandler(async (req, res) => {
	const { user, product, value } = req.body
	if (req.user.id != user) {
		return res
			.status(403)
			.json({ message: "ممنوع الوصول، لا يمكن اضافة تقييم لمستخدم اخر، فقط لنفسك." })
	}
	const existRate = await Rating.findOne({ user, product })
	if (existRate) {
		const updated = await Rating.findByIdAndUpdate(
			existRate._id,
			{
				$set: {
					value,
				},
			},
			{
				new: true,
				runValidators: true,
			},
		).populate('user', 'username')
		return res.status(200).json({ message: 'تم تعديل التقييم بنجاح', rate: updated })
	}
	const rate = await Rating.create({
		user,
		product,
		value,
	})
	const populatedRate = await Rating.populate(rate, { path: 'user', select: 'username' })
	res.status(201).json({ message: 'تمت اضافة التقييم بنجاح.', rate: populatedRate })
})

/** ----------------------------------------------------------------
 * @desc delete rate
 * @route /api/ratings/:id
 * @method DELETE
 * @access owner
   -----------------------------------------------------------------
 */
module.exports.deleteRate = asyncHandler(async (req, res) => {
	const { id } = req.params
	const rate = await Rating.findById(id)
	if (!rate) {
		return res.status(404).json({ message: 'التقييم غير موجود.' })
	}
	if (req.user.id !== rate.user.toString()) {
		return res.status(403).json({ message: 'ممنوع الوصول، فقط صاحب التقييم.' })
	}
	await Rating.findByIdAndDelete(id)
	res.status(200).json({ message: 'تم الحذف بنجاح.' })
})

/** ----------------------------------------------------------------
 * @desc get all ratings
 * @route /api/ratings/
 * @method GET
 * @access admin or employee
   -----------------------------------------------------------------
 */
module.exports.getAllRatings = asyncHandler(async (req, res) => {
	const ratings = await Rating.find().populate([
		{ path: 'user', select: 'username' },
		{ path: 'product', select: 'name' },
	])
	res.status(200).json(ratings)
})

/** ----------------------------------------------------------------
 * @desc get ratings for a product with pagination and sort
 * @route /api/ratings/product/:id
 * @method GET
 * @access public
   -----------------------------------------------------------------
 */
module.exports.getRatingsForProduct = asyncHandler(async (req, res) => {
	const productId = req.params.id
	const { page = 1, limit = 10, sort = '-createdAt' } = req.query
	const skip = (page - 1) * limit

	const ratings = await Rating.find({ product: productId })
		.skip(skip)
		.limit(parseInt(limit))
		.sort(sort)
		.populate('user', 'username')

	res.status(200).json(ratings)
})
