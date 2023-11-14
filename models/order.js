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
			required: [true, 'رقم الهاتف مطلوب.'],
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
				productNotes: {
					type: String,
				},
			},
		],
		status: {
			type: String,
			enum: {
				values: ['pending', 'confirmed', 'shipped', 'canceled'],
				message: 'الحالات المسموحة: قيد الانتظار، تم التأكيد، تم التوصيل، ملغي.',
			},
			default: 'pending',
			required: [true, 'حالة الطلب مطلوبة.'],
		},
		shippingAddress: {
			type: String,
			required: [true, 'عنوان الطلب مطلوب.'],
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

const Order = mongoose.model('Order', orderSchema)

module.exports = { Order }
