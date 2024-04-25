const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const JWT_SECRET = "Iaminatwitter";
let success = false;

// Multer
// const multer = require('multer');
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, "../frontend/src/images/")
//     },
//     filename: function (req, file, cb) {
//         const uniqueSuffix = Date.now();
//         cb(null, uniqueSuffix + file.originalname);
//     }
// })
// const upload = multer({ storage: storage })


// Route-1: Register a user using: POST "/api/auth/signup". No login required
router.post('/signup', async (req, res) => {
    try {
        let user = await User.findOne({ email: req.body.email });
        if (user) {
            success = false;
            return res.status(400).json({ success, error: 'Sorry a user with this email is already exist' });
        }
        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(req.body.password, salt);

        //Create a new user
        user = await User.create({
            name: req.body.name,
            username: req.body.username,
            email: req.body.email,
            password: secPass,
            location: req.body.location,
            dob: req.body.dob,
            bio: req.body.bio,
            image: req.body.imageUrl,
            public_id: req.body.public_id,
        });
        const data = {
            user: {
                id: user.id
            }
        }
        const authToken = jwt.sign(data, JWT_SECRET);
        success = true;
        res.json({ success, authToken: authToken, username: user.username, image: user.image, userId: user._id });
    } catch (error) {
        success = false;
        console.log(error.message);
        res.status(500).send(success + "Internal server error");
    }
});

// Route-2: Authenticate a user using: POST "/api/auth/user/login". No login required
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        let user = await User.findOne({ email });
        if (!user) {
            success = false;
            return res.status(400).json({ success, error: 'Please try to login with correct credentials' });
        }
        const passwordCompare = await bcrypt.compare(password, user.password);
        if (!passwordCompare) {
            success = false;
            return res.status(400).json({ success, error: 'Please try to login with correct credentials' });
        }
        const data = {
            user: {
                id: user.id
            }
        }
        const authToken = jwt.sign(data, JWT_SECRET);
        success = true;
        res.json({ success, authToken: authToken, username: user.username, image: user.image, userId: user._id });
    } catch (error) {
        console.log(error.message);
        res.status(500).send(success + "Internal server error");
    }
});


module.exports = router;