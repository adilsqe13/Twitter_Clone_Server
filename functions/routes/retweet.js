const express = require('express');
const router = express.Router();
const fetchuser = require('../middleware/fetchuser');
const Tweets = require('../models/Tweet');
const User = require('../models/User');
const { ObjectId } = require('mongodb');
const deleteImage = require('../modules/delete-image');


// Route-1: Repost a retweet using: POST,  Login required
router.post('/retweet-repost', fetchuser, async (req, res) => {
  try {
    const tweetId = req.body.tweetId;
    const retweetId = req.body.retweetId;
    const userId = req.user.id;
    const user = await User.findOne({ _id: userId });
    const username = user.username;
    const name = user.name;
    const profileImage = user.image;
    const tweet = await Tweets.findOne({ _id: tweetId });
    const retweets = tweet.RetweetBy;
    const targetRetweetId = new ObjectId(retweetId);
    const retweet = retweets.find((el) => el._id.equals(targetRetweetId));
    const content = retweet.content;
    const image = retweet.image;

    //Create a new tweet
    await Tweets.create({ userId: req.user.id, content: content, image: image, userImage: profileImage, username: username, name: name });
    await Tweets.updateOne(
      { _id: tweetId, "RetweetBy._id": retweetId },
      {
        $push: {
          "RetweetBy.$.RepostBy": userId
        }
      }
    );
    res.status(200).json({ success: true });

  } catch (error) {
    success = false;
    console.log(error.message);
    res.status(500).send(success + "Internal server error");
  }
});

// Route-2: Delete a retweet using: DELETE,   Login required
router.delete('/delete-retweet', fetchuser, async (req, res) => {
  try {
    const tweetId = req.body.tweetId;
    const retweetId = req.body.retweetId;
    const tweet = await Tweets.findOne({_id: tweetId});
    const retweets = tweet.RetweetBy
    const retweet = retweets.filter((e)=> { return (e._id == retweetId)});
    const public_id = retweet[0].public_id;
    await Tweets.updateOne(
      { _id: tweetId },
      {
        $pull: {
          RetweetBy: {
            _id: retweetId
          }
        }
      }
    );
    if(public_id){
      await deleteImage(public_id);
    }
    res.json({ success: true });

  } catch (error) {
    success = false;
    console.log(error.message);
    res.status(500).send(success + "Internal server error");
  }
});


module.exports = router;