const mogoose = require('mongoose')
const { Comment } = require('./comment')

const productSchema = new mogoose.Schema(
	{
		name: {
			type: String,
			required: [true, 'اسم المنتج مطلوب.'],
		},
		source: {
			type: String,
			required: [true, 'مصدر المنتج مطلوب.'],
			lowercase: true,
		},
		image: {
			type: {
				url: String,
				publicId: String,
			},
			required: [true, 'صورة المنتج مطلوبة.'],
		},
		category: {
			type: String,
			required: [true, 'فئة المنتج مطلوبة.'],
			lowercase: true,
		},
		description: {
			type: String,
			required: [true, 'وصف المنتج مطلوب.'],
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

productSchema.virtual('comments', {
	ref: 'Comment',
	localField: '_id',
	foreignField: 'product',
})
productSchema.virtual('ratings', {
	ref: 'Rating',
	localField: '_id',
	foreignField: 'product',
})
productSchema.virtual('averageRating').get(function () {
	if (this?.ratings?.length == 0) {
		return 0
	}
	const sum = this.ratings?.reduce((total, rating) => total + rating.value, 0)
	return sum / this.ratings?.length
})
 

const Product = mogoose.model('Product', productSchema)

module.exports = { Product }
