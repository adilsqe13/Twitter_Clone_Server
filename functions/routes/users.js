require('dotenv').config();
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Tweets = require('../models/Tweet');
const fetchuser = require('../middleware/fetchuser');
const deleteImage = require('../modules/delete-image');
let success = false;

// Route-1: Get all users: GET,  Login required
router.get('/get-all-users', async (req, res) => {
  try {
    const user = await User.find({});
    res.json(user);
  } catch (error) {
    console.error(error);
  }
});

// Route-2: Get a user: GET,  Login required
router.get('/get-a-user/:userId', fetchuser, async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.find({ _id: userId });
    res.json(user);
  } catch (error) {
    console.error(error);
  }
});

// Route-3: Following a user : GET,    Login required
router.put('/following/:followingId', fetchuser, async (req, res) => {
  try {
    const followingId = req.params.followingId;
    const userId = req.user.id;
    const followingUser = await User.findOne({ _id: followingId });
    const count = followingUser.followers.filter((id) => {
      return id === userId;
    });

    if (count.length === 0) {
      await User.updateOne(
        { _id: followingId },
        { $push: { followers: userId } }
      );
      await User.updateOne(
        { _id: userId },
        { $push: { following: followingId } }
      );
    } else {
      await User.updateOne(
        { _id: followingId },
        { $pull: { followers: userId } }
      );
      await User.updateOne(
        { _id: userId },
        { $pull: { following: followingId } }
      );
    }
    success = true;
    res.status(200).json(success);

  } catch (error) {
    success = false;
    console.log(error.message);
    res.status(500).send(success + "Internal server error");
  }
});

// Route-4: Edit Profile : PUT,   Login required
router.put('/edit-profile', fetchuser, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findOne({ _id: userId });
    const profileImage = user.image;
    const oldPublicId = user.public_id;
    const image = req.body.imageUrl;
    const public_id = req.body.public_id;
    const name = req.body.name;
    const location = req.body.location;
    const dob = req.body.dob;
    const bio = req.body.bio;

    if (image !== null) {
      await User.updateOne(
        { _id: userId },
        { $set: { name, location, dob, bio, image, public_id } }
      );
      await Tweets.updateMany({ userId }, { name: name, userImage: image });
      await Tweets.updateMany(
        { 'RetweetBy.userId': userId },
        { $set: { 'RetweetBy.$.name': name, 'RetweetBy.$.profileImage': image } }
      );

      //Delete image from cloudinary
      await deleteImage(oldPublicId);
      
      res.status(200).json({ success: true });
    } else {
      await User.updateOne(
        { _id: userId },
        { $set: { name, location, dob, bio } }
      );
      await Tweets.updateMany({ userId }, { name: name });
      await Tweets.updateMany(
        { 'RetweetBy.userId': userId },
        { $set: { 'RetweetBy.$.name': name } }
      );
      res.status(200).json({ success: true, image: profileImage });
    }

  } catch (error) {
    success = false;
    console.log(error.message);
    res.status(500).send(success + "Internal server error");
  }
});



module.exports = router;