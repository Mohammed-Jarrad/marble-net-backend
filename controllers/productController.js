const asyncHandler = require('express-async-handler')
const { cloudinaryUploadImage, cloudinaryRemoveImage } = require('../utils/cloudinary')
const { Product } = require('../models/product')
const { Order } = require('../models/order')
const { Comment } = require('../models/comment')
const { Rating } = require('../models/rating')
const { Cart } = require('../models/cart')

/** ----------------------------------------------------------------
 * @desc create new product
 * @route /api/products/
 * @method POST
 * @access onlyAdminOrEmployee
   -----------------------------------------------------------------
 */
module.exports.createProduct = asyncHandler(async (req, res) => {
	const { name, description, category, source } = req.body
	const image = req.file
	if (!image) {
		return res.status(400).json({ message: 'No image provided.' })
	}
	const product = new Product({
		name,
		description,
		category,
		source,
		image: {
			url: '',
			publicId: '',
		},
	})
	await product.validate()
	const result = await cloudinaryUploadImage(image.buffer, image.mimetype)
	product.image = new Object({ url: result.secure_url, publicId: result.public_id })
	await product.save()
	res.status(201).json({ product, message: 'Created succesfully.' })
})
/** ----------------------------------------------------------------
 * @desc get all product
 * @route /api/products
 * @method GET
 * @access public
   -----------------------------------------------------------------
 */
module.exports.getAllProducts = asyncHandler(async (req, res) => {
	const { source, category, search } = req.query
	const filter = {}
	if (source) filter.source = { $in: source.split(',').map(e => e.trim()) }
	if (category) filter.category = { $in: category.split(',').map(e => e.trim()) }
	if (search) {
		filter.$or = [
			{ name: { $regex: new RegExp(search, 'i') } },
			{ description: { $regex: new RegExp(search, 'i') } },
		]
	}
	const products = await Product.find(filter)
		.sort({ createdAt: -1 })
		.populate([
			{ path: 'comments', populate: { path: 'user', select: 'username' } },
			{ path: 'ratings', populate: { path: 'user', select: 'username' } },
		])

	res.status(200).json(products)
})
/** ----------------------------------------------------------------
 * @desc get product
 * @route /api/products/:id
 * @method GET
 * @access public
   -----------------------------------------------------------------
 */
module.exports.getProduct = asyncHandler(async (req, res) => {
	const product = await Product.findById(req.params.id).populate([
		{ path: 'comments', populate: { path: 'user', select: 'username' } },
		{ path: 'ratings', populate: { path: 'user', select: 'username' } },
	])
	res.status(200).json(product)
})
/** ----------------------------------------------------------------
 * @desc update product
 * @route /api/products/:id
 * @method PUT
 * @access admin or employee
   -----------------------------------------------------------------
 */
module.exports.updateProduct = asyncHandler(async (req, res) => {
	const { name, source, category, description } = req.body
	const product = await Product.findById(req.params.id)
	if (!product) {
		return res.status(400).json({ message: 'Product not found.' })
	}
	const orders = await Order.find({ product: req.params.id })
	if (orders.length > 0) {
		return res
			.status(400)
			.json({ message: "Can't update this product. This product has at lease one order." })
	}
	const updatedProduct = await Product.findByIdAndUpdate(
		req.params.id,
		{
			$set: {
				name,
				source,
				category,
				description,
			},
		},
		{
			new: true,
			runValidators: true,
		},
	).populate([
		{ path: 'comments', populate: { path: 'user', select: 'username' } },
		{ path: 'ratings', populate: { path: 'user', select: 'username' } },
	])
	res.status(200).json({ product: updatedProduct, message: 'Product updated succesfully.' })
})
/** ----------------------------------------------------------------
 * @desc update product image
 * @route /api/products/update-image/:id
 * @method PUT
 * @access admin or employee
   -----------------------------------------------------------------
 */
module.exports.updateProductImage = asyncHandler(async (req, res) => {
	const image = req.file
	if (!image) {
		return res.status(400).json({ message: 'No image provided.' })
	}
	const product = await Product.findById(req.params.id)
	if (!product) {
		return res.status(404).json({ message: 'Product not found.' })
	}
	const orders = await Order.find({ product: req.params.id })
	if (orders.length > 0) {
		return res
			.status(400)
			.json({ message: "Can't update this product image. This product has at lease one order." })
	}
	// delete old image
	await cloudinaryRemoveImage(product.image.publicId)
	// upload new image
	const result = await cloudinaryUploadImage(image.buffer, image.mimetype)
	// edit product image feilds
	const updatedProduct = await Product.findByIdAndUpdate(req.params.id, {
		$set: {
			image: {
				url: result.secure_url,
				publicId: result.public_id,
			},
		},
	}).populate([
		{ path: 'comments', populate: { path: 'user', select: 'username' } },
		{ path: 'ratings', populate: { path: 'user', select: 'username' } },
	])
	res.status(200).json({ product: updatedProduct, message: 'Product image updated succesfully.' })
})
/** ----------------------------------------------------------------
 * @desc get products count 
 * @route /api/products/count
 * @method GET
 * @access admin or employee
   -----------------------------------------------------------------
 */
module.exports.getProductsCount = asyncHandler(async (req, res) => {
	const count = await Product.count()
	res.status(200).json(count)
})

/** ----------------------------------------------------------------
 * @desc delete product
 * @route /api/products/:id
 * @method DELETE
 * @access admin or employee
   -----------------------------------------------------------------
 */
module.exports.deleteProduct = asyncHandler(async (req, res) => {
	const product = await Product.findById(req.params.id)
	if (!product) {
		return res.status(404).json({ message: 'Product not found.' })
	}
	const orders = await Order.find({ product: req.params.id })
	if (orders.length > 0) {
		return res
			.status(400)
			.json({ message: "Can't delete this product. This product has at lease one order." })
	}
	// deletr product
	await Product.findByIdAndDelete(req.params.id)
	// delete product image from cloudinary
	await cloudinaryRemoveImage(product.image.publicId)
	// delete all comments that belong to this product
	await Comment.deleteMany({ product: req.params.id })
	// delete all ratings that belong to this product
	await Rating.deleteMany({ product: req.params.id })
	// delete product from all carts has this product
	await Cart.updateMany(
		{
			'items.product': req.params.id,
		},
		{
			$pull: { items: { product: req.params.id } },
		},
		{
			new: true,
		},
	)
	// response
	res.status(200).json({ message: 'Deleted succesfully.', productId: product._id })
})
