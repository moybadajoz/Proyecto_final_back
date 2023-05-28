const { string } = require('@hapi/joi')
const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    name: {
        type: String,
        max: 255,
        required: true
    },
    email: {
        type: String,
        required: true,
        max: 255
    },
    password: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }

})

module.exports = mongoose.model('user', userSchema)