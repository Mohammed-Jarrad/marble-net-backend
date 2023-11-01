const mogoose = require('mongoose')

const ratingSchema = new mogoose.Schema(
	{
		user: {
			type: mogoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		product: {
			type: mogoose.Schema.Types.ObjectId,
			ref: 'Product',
			required: true,
		},
		value: {
			type: Number,
            enum: {
                values: [1, 2, 3, 4, 5],
                message: "Allowed values is: 1, 2, 3, 4, 5."
            },
            required: [true, 'Please add a value.']
		},
	},
	{
		timestamps: true,
	},
)

const Rating = mogoose.model('Rating', ratingSchema)

module.exports = { Rating }
