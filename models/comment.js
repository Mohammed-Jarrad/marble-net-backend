const mogoose = require('mongoose')

const commentSchema = new mogoose.Schema(
	{
		user: {
            type: mogoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
		product: {
            type: mogoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },
		text: {
            type: String,
            required: [true, "Please write somthing."]
        },
	},
	{
		timestamps: true,
	},
)

const Comment = mogoose.model('Comment', commentSchema)

module.exports = { Comment }
