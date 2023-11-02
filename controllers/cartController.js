const asyncHandler = require('express-async-handler')
const { Cart } = require('../models/cart')

/** ----------------------------------------------------------------
 * @desc remove item from cart
 * @route /api/carts/add
 * @method PUT
 * @access owner of the cart
   -----------------------------------------------------------------
 */
module.exports.addItemToCart = asyncHandler(async (req, res) => {
	const { cartId, product, quantity } = req.body
	const cart = await Cart.findById(cartId)
	if (!cart) {
		return res.status(400).json({ message: 'Cart not found.' })
	}
	if (req.user.id !== cart.user.toString()) {
		return res.status(403).json({ message: 'Access denied. Only cart owner allowed to add items.' })
	}
	const itemIndex = cart.items.findIndex(item => item.product.toString() == product)
	if (itemIndex !== -1) {
		// item already exists, update quantity
		cart.items[itemIndex].quantity += quantity
	} else {
		// item doesn't exists, add it to items
		cart.items.push({ product, quantity })
	}
	await cart.save()
	res.status(200).json({ cart, message: 'Item added to cart succesfully.' })
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
		return res.status(404).json({ message: 'Cart not found.' })
	}
	if (req.user.id !== _cart.user.toString()) {
		return res.status(403).json({ message: 'Access denied. Only owner of the cart can delete items.' })
	}
	const itemIndex = _cart.items.findIndex(item => item.product.toString() === product)
	if (itemIndex === -1) {
		return res.status(400).json({ message: 'Product not found in the cart.' })
	}
	const cart = await Cart.findByIdAndUpdate(
		cartId,
		{
			$pull: { items: { product } },
		},
		{ new: true },
	)
	res.status(200).json({ cart, message: 'Cart items removed succesfully.' })
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
		{ path: 'items.product', select: 'name image source category price' },
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
		return res.status(404).json({ message: 'Cart not found.' })
	}
	if (req.user.id !== cart.user.toString()) {
		return res
			.status(403)
			.json({ message: 'Access denied. Only owner of the cart can increase or decrease the quantity.' })
	}
	const itemIndex = cart.items.findIndex(item => item.product.toString() == product)
	if (itemIndex == -1) {
		return res.status(404).json({ message: 'Product not found in the cart.' })
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
				// delete the item if the giver quantity is larger than actual quantity
				cart.items.splice(itemIndex, 1)
			}
			break
		default:
			return res.status(400).json({ message: 'Invalid operation type.' })
	}
	await cart.save()
	res.status(200).json({ cart, message: 'Product quantity updated succesfully.' })
})