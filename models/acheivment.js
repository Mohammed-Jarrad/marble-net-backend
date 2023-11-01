const mogoose = require('mongoose')

const acheivmentSchema = new mogoose.Schema({})

const Acheivment = mogoose.model('Acheivment', acheivmentSchema)

module.exports = { Acheivment }