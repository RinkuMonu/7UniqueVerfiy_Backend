const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    mainImage: {
        type: String,
    },
    status: {
        type: Boolean,
        default: true
    },
    tags: [{
        type: String,
        lowercase: true,
    }],
    // maltipleImage: [
    //     {
    //         type: String
    //     }
    // ],
    short_description: {
        type: String
    },
    long_description: {
        type: String
    },
    isPublished: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    // comment: [
    //     {
    //         user: {
    //             type: mongoose.Schema.Types.ObjectId,
    //             ref: 'user',
    //             required: true
    //         },
    //         text: {
    //             type: String,
    //             required: true
    //         },
    //         createdAt: {
    //             type: Date,
    //             default: Date.now
    //         }
    //     }
    // ]

});

const blogModel = mongoose.model('blog', BlogSchema);
module.exports = blogModel;
