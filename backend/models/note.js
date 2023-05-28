const mongoose = require('mongoose')
const company = require('./user')

const noteSchema = mongoose.Schema({
    id_use: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    }, 
    title: {
        type: String, 
        max: 255,
    },
    content: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('note', noteSchema)