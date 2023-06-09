const mongoose = require('mongoose')
const company = require('./user')

const noteSchema = mongoose.Schema({
    id_user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    }, 
    title: {
        type: String
    },
    content: {
        type: String
    },
    color: {
        type: String,
        default: '#FFFFFF'
    },
    date: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('note', noteSchema)