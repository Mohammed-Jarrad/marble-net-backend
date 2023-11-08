const asyncHandler = require('express-async-handler')
const { Comment } = require('../models/comment')

/** ----------------------------------------------------------------
 * @desc create comment
 * @route /api/comments/
 * @method POST
 * @access only logged in user himself
   -----------------------------------------------------------------
 */
module.exports.createComment = asyncHandler(async (req, res) => {
	const { user, product, text } = req.body
	if (req.user.id != user) {
		return res
			.status(403)
			.json({ message: "Access denied. Can't add comment for another user. Only for you." })
	}
	const comment = await Comment.create({
		user,
		product,
		text,
	})
	const populatedComment = await Comment.populate(comment, { path: "user", select: "username" })
	res.status(201).json(populatedComment)
})
/** ----------------------------------------------------------------
 * @desc update comment
 * @route /api/comments/:id
 * @method PUT
 * @access the owner of comment
   -----------------------------------------------------------------
 */
module.exports.updateComment = asyncHandler(async (req, res) => {
	const { id } = req.params
	const { text } = req.body
	// check if the comment founded
	const comment = await Comment.findById(id)
	if (!comment) {
		return res.status(404).json({ message: 'Comment not found.' })
	}
	// check if the user_id is the same of comment_user_id
	if (req.user.id !== comment.user.toString()) {
		return res.status(403).json({ message: 'Access denied. Only the owner of comment.' })
	}
	// update comment
	const updatedComment = await Comment.findByIdAndUpdate(
		id,
		{
			$set: {
				text,
			},
		},
		{
			new: true,
			runValidators: true,
		},
	).populate('user', 'username')
	res.status(200).json(updatedComment)
})

/** ----------------------------------------------------------------
 * @desc delete comment
 * @route /api/comments/:id
 * @method DELETE
 * @access the owner of comment or admin or employee
   -----------------------------------------------------------------
 */
module.exports.deleteComment = asyncHandler(async (req, res) => {
	const { id } = req.params
	// check if the comment founded
	const comment = await Comment.findById(id)
	if (!comment) {
		return res.status(404).json({ message: 'Comment not found.' })
	}
	// check if the user_id is the same of cooment_user_id or the user is admin
	if (
		req.user.id == comment.user.toString() ||
		req.user.role == 'admin' ||
		req.user.role == 'employee'
	) {
		await Comment.findByIdAndDelete(id)
		return res.status(200).json({ message: 'Deleted succesfully.' })
	} else {
		return res.status(403).json({ message: 'Access denied. Only the owner of comment or admin.' })
	}
})
/** ----------------------------------------------------------------
 * @desc get all comments
 * @route /api/comments/
 * @method GET
 * @access admin or employee
   -----------------------------------------------------------------
 */
module.exports.getAllComments = asyncHandler(async (req, res) => {
	const comments = await Comment.find().populate('user', 'username _id')
	res.status(200).json(comments)
})
/** ----------------------------------------------------------------
 * @desc get comments count
 * @route /api/comments/count
 * @method GET
 * @access admin or employee
   -----------------------------------------------------------------
 */
module.exports.getCommentsCount = asyncHandler(async (req, res) => {
	const count = await Comment.count()
	res.status(200).json(count)
})

/** ----------------------------------------------------------------
 * @desc Get comments for a product with pagination and sorting
 * @route /api/comments/product/:id
 * @method GET
 * @access public
   -----------------------------------------------------------------
 */
module.exports.getCommentsForProduct = asyncHandler(async (req, res) => {
	const productId = req.params.id
	const { sort = '-createdAt' } = req.query

	const comments = await Comment.find({ product: productId }).sort(sort).populate('user', 'username')

	res.status(200).json(comments)
})
