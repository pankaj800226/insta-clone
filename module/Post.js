const mongoose = require('mongoose')

const ImageSchema = new mongoose.Schema({
    image: {
        type: String,
        required: true,
    },
    tital: {
        type: String,
        required: true,

    },

    comments: [{
        type: String,
        required: true,
    }],

    likes: {
        type: Number,
        default: 0,
    }
})

const imageModel = mongoose.model('image', ImageSchema);

module.exports = imageModel

