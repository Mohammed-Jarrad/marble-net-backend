const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
	username: {
		type: String,
		required: [true, 'الاسم مطلوب.'],
		unique: true,
		minLength: [3, 'يجب ان يكون الاسم 3 رموز على الاقل.'],
		trim: true,
	},
	email: {
		type: String,
		required: [true, 'البريد الالكتروني مطلوب.'],
		match: [/^\S+@\S+\.\S+$/, 'الرجاء قم بادخال بريد الكتروني صالح.'],
		unique: true,
		lowercase: true,
	},
	password: {
		type: String,
		required: [true, 'كلمة المرور مطلوبة.'],
		minLength: [6, 'يجب ان تكون كلمة المرور من 6 رموز على الاقل.'],
	},
	role: {
		type: String,
		enum: {
			values: ['admin', 'employee', 'customer'],
			message: 'القيم المسموحة: admin, employee, customer.',
		},
		required: [true, 'حالة المستخدم مطلوبة.'],
		default: 'customer',
	},
	cart: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Cart',
	},
})

// generate auth token
userSchema.methods.generateAuthToken = function () {
	return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECURITY)
}

const User = mongoose.model('User', userSchema)

module.exports = {
	User,
}
