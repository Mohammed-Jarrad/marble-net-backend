const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		userPhone: {
			type: String,
			required: [true, 'User phone number is required.'],
		},
		products: [
			{
				product: {
					type: mongoose.Schema.Types.ObjectId,
					ref: 'Product',
					required: true,
				},
				quantity: {
					type: Number,
					required: true,
					default: 1,
				},
			},
		],
		status: {
			type: String,
			enum: {
				values: ['pending', 'confirmed', 'shipped', 'canceled'],
				message: 'Status allowed values: pending, confirmed, shipped, canceled.',
			},
			default: 'pending',
			required: [true, 'Order status is required.'],
		},
		shippingAddress: {
			type: String,
			required: [true, "Order address is required."],
		},
		notes: {
			type: String,
		},
	},
	{
		timestamps: true,
		toJSON: {
			virtuals: true,
		},
		toObject: {
			virtuals: true,
		},
	},
)

orderSchema.virtual('totalAmount').get(function () {
	let sum = 0
	this.products.map(item => {
		sum += item.product.price * item.quantity
	})
	return sum
})

const Order = mongoose.model('Order', orderSchema)

module.exports = { Order }
