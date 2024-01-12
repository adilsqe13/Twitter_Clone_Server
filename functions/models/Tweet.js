const mongoose = require('mongoose');
const { Schema } = mongoose;

const TweetSchema = new Schema({
    content: {
        type: String,
        required: false
    },
    userId: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true,
        ref: 'User',
    },
    userImage: {
        type: String,
        ref: 'User',
    },
    Likes: {
        type: Array,
        ref: 'User',
    },
    RetweetBy: {
        type: [
            {
                userId: {
                    type: String,
                    required: true,
                    ref: 'User',
                },
                username: {
                    type: String,
                    ref: 'User',
                },
                name: {
                    type: String,
                    ref: 'User',
                },
                profileImage: {
                    type: String,
                    ref: 'User',
                },
                content: {
                    type: String,
                    required: false,
                },
                RepostBy: {
                    type: Array,
                    ref: 'User',
                },
                image: {
                    type: String,
                    required: false,
                },
                public_id: {
                    type: String,
                    required: false,
                },
                date: {
                    type: Date,
                    default: Date.now
                },
            }
        ],
        ref: 'User',
    },
    RepostBy: {
        type: Array,
        ref: 'User',
    },
    image: {
        type: String,
        required: false,
    },
    public_id: {
        type: String,
        required: false,
    },
    date: {
        type: Date,
        default: Date.now
    },
});

module.exports = mongoose.model('tweets', TweetSchema);