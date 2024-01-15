const asyncHandler = require('express-async-handler')
const { Cart } = require('../models/cart')

/** ----------------------------------------------------------------
 * @desc add item from cart
 * @route /api/carts/add
 * @method PUT
 * @access owner of the cart
   -----------------------------------------------------------------
 */
module.exports.addItemToCart = asyncHandler(async (req, res) => {
	const { cartId, product, quantity, productNotes } = req.body
	const cart = await Cart.findById(cartId)
	if (!cart) {
		return res.status(400).json({ message: 'غير موجود!' })
	}
	if (req.user.id.toString() !== cart.user.toString()) {
		return res.status(403).json({ message: 'ممنوع الوصول. فقط صاحب السلة يستطيع الاضافة عليها.' })
	}
	const itemIndex = cart.items.findIndex(item => item.product.toString() == product)
	if (itemIndex !== -1) {
		// item already exists, update quantity
		cart.items[itemIndex].quantity += quantity
	} else {
		// item doesn't exists, add it to items
		cart.items.push({ product, quantity, productNotes })
	}
	await cart.save()
	const populatedCart = await Cart.populate(cart, [
		{ path: 'user', select: 'username email' },
		{
			path: 'items.product',
			select: 'name image source category ratings averageRatings',
			populate: { path: 'ratings', select: 'value' },
		},
	])
	res.status(200).json({ cart: populatedCart, message: 'تمت اضافة المنتج بنجاح.' })
})

/** ----------------------------------------------------------------
 * @desc remove item from cart
 * @route /api/carts/remove
 * @method PUT
 * @access only owner of the cart
   -----------------------------------------------------------------
 */
module.exports.removeItemFromCart = asyncHandler(async (req, res) => {
	const { cartId, product } = req.body

	const _cart = await Cart.findById(cartId)
	if (!_cart) {
		return res.status(404).json({ message: 'غير موجود!' })
	}
	if (req.user.id.toString() !== _cart.user.toString()) {
		return res.status(403).json({ message: 'ممنوع الوصول. فقط صاحب السلة يستطيع الحذف منها.' })
	}
	const itemIndex = _cart.items.findIndex(item => item.product.toString() === product)
	if (itemIndex === -1) {
		return res.status(400).json({ message: 'المنتج غير موجود في السلة!' })
	}
	const cart = await Cart.findByIdAndUpdate(
		cartId,
		{
			$pull: { items: { product } },
		},
		{ new: true },
	)
	const populatedCart = await Cart.populate(cart, [
		{ path: 'user', select: 'username email' },
		{
			path: 'items.product',
			select: 'name image source category ratings averageRatings',
			populate: { path: 'ratings', select: 'value' },
		},
	])
	res.status(200).json({ cart: populatedCart, message: 'تمت ازالة العنصر من السلة.' })
})

/** ----------------------------------------------------------------
 * @desc get cart for user
 * @route /api/carts/user/:id
 * @method GET
 * @access logged in user
   -----------------------------------------------------------------
 */
module.exports.getCartForUser = asyncHandler(async (req, res) => {
	const cart = await Cart.findOne({ user: req.params.id }).populate([
		{ path: 'user', select: 'username email' },
		{
			path: 'items.product',
			select: 'name image source category ratings averageRatings',
			populate: { path: 'ratings', select: 'value' },
		},
	])
	res.status(200).json(cart)
})

/** ----------------------------------------------------------------
 * @desc increase or descrese quantity of product in the cart
 * @route /api/carts/inc-dec-quantity
 * @method PUT
 * @access only owner of the cart
   -----------------------------------------------------------------
 */
module.exports.IncOrDecQuantityForProduct = asyncHandler(async (req, res) => {
	const { type, product, quantity, cartId } = req.body
	const cart = await Cart.findById(cartId)
	if (!cart) {
		return res.status(404).json({ message: 'غير موجود!' })
	}
	if (req.user.id.toString() !== cart.user.toString()) {
		return res
			.status(403)
			.json({ message: 'ممنوع الوصول. فقط صاحب السلة يستطيع زيادة او تخفيض كمية المنتجات.' })
	}
	const itemIndex = cart.items.findIndex(item => item.product.toString() == product)
	if (itemIndex == -1) {
		return res.status(404).json({ message: 'المنتج غير موجود في السلة.' })
	}
	switch (type) {
		case 'increase':
			cart.items[itemIndex].quantity += quantity
			break
		case 'decrease':
			// ensure the quantity doesn't go below 1
			if (cart.items[itemIndex].quantity > quantity) {
				cart.items[itemIndex].quantity -= quantity
			} else {
				// delete the item if the given quantity is larger than actual quantity
				cart.items.splice(itemIndex, 1)
			}
			break
		default:
			return res.status(400).json({ message: 'عملية غير صحيحة.' })
	}
	await cart.save()
	const populatedCart = await Cart.populate(cart, [
		{ path: 'user', select: 'username email' },
		{
			path: 'items.product',
			select: 'name image source category ratings averageRatings',
			populate: { path: 'ratings', select: 'value' },
		},
	])
	res.status(200).json({ cart: populatedCart, message: 'تم تعديل الكمية بنجاح.' })
})
