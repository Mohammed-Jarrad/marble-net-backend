const mogoose = require('mongoose')
const jwt = require('jsonwebtoken')

const userSchema = new mogoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required.'],
        unique: true,
        minLength: [3, 'Username must be at least 3 characters.'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Email is required.'],
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address.'],
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: [true, "Password is required."],
        minLength: [6, "Password must be at least 6 characters."],
    },
    role: {
        type: String,
        enum: { 
            values: ['admin', 'employee', 'customer'], 
            message: 'Role is either admin, employee, or customer.' 
        },
        required: [true, 'Role is required.'],
        default: 'customer'
    },
})

// generate auth token
userSchema.methods.generateAuthToken = function() {
    return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECURITY)
}

const User = mogoose.model('User', userSchema)

module.exports = {
    User
}