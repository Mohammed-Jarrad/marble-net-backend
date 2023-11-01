const mogoose = require('mongoose')
const { Comment } = require('./comment')

const productSchema = new mogoose.Schema(
	{
		name: {
			type: String,
			required: [true, 'Product name is required.'],
		},
		source: {
			type: String,
			required: [true, 'Product source is required.'],
			lowercase: true,
		},
		image: {
			type: {
				url: String,
				publicId: String,
			},
			required: [true, 'Product image is required.'],
		},
		category: {
			type: String,
			required: [true, 'Product category is required.'],
			lowercase: true,
		},
		description: {
			type: String,
			required: [true, 'Product description is required.'],
		},
		price: {
			type: Number,
			required: [true, 'Product price is required.'],
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
	console.log(this.ratings)
	if (this?.ratings?.length == 0) {
		return 0
	}
	const sum = this.ratings?.reduce((total, rating) => total + rating.value, 0)
	return sum / this.ratings?.length
})
 

const Product = mogoose.model('Product', productSchema)

module.exports = { Product }
