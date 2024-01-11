const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserProfileSchema = new Schema({
    name:{
        type: String,
        required: true
    },
    image:{
        type: String,
        required: true
    },
    public_id:{
        type: String,
        required: true
    },
    username:{
        type: String,
        required: true,
        unique: true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    },
    bio:{
        type: String,
        required: false
    },
    location:{
        type: String,
        required: false
    },
    dob:{
        type: String,
        required: false
    },
    followers:{
        type: Array,
    },
    following:{
        type: Array,
    },
    date:{
        type: Date,
        default: Date.now
    },
});

module.exports = mongoose.model('users', UserProfileSchema);