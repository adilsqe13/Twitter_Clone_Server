const express = require('express');
const router = express.Router();
const fetchuser = require('../middleware/fetchuser');
const Tweets = require('../models/Tweet');
const User = require('../models/User');
const deleteImage = require('../modules/delete-image');


// Route-1: Post a tweet using: POST "/api/tweet/post-tweet". Login required
router.post('/post-tweet', fetchuser, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user.id });
    if (req.body.imageUrl !== null) {

      //Create a new tweet
      await Tweets.create({ userId: req.user.id, content: req.body.content, image: req.body.imageUrl, public_id: req.body.public_id, userImage: user.image, username: user.username, name: user.name });
      res.status(200).json({ success: true });
    } else {
      //Create a new tweet
      await Tweets.create({ userId: req.user.id, content: req.body.content, userImage: user.image, username: user.username, name: user.name });
      res.status(200).json({ success: true });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).send({ success: false + "Internal server error" });
  }
});

// Route-2: Get all tweets using: GET "/api/tweet/get-all-tweets". Login required
router.get('/get-all-tweets', async (req, res) => {
  try {
    const allTweets = await Tweets.find();
    res.json(allTweets);
  } catch (error) {
    success = false;
    console.log(error.message);
    res.status(500).send(success + "Internal server error");
  }
});

// Route-3: Get user tweets using: GET,  Login required
router.get('/get-user-tweets/:userId', fetchuser, async (req, res) => {
  try {
    const userId = req.params.userId;
    const allTweets = await Tweets.find({ userId: userId });
    res.json(allTweets);
  } catch (error) {
    success = false;
    console.log(error.message);
    res.status(500).send(success + "Internal server error");
  }
});

// Route-4: Like a tweet by a user using: PUT,  Login required
router.put('/likeTweet/:tweetId', fetchuser, async (req, res) => {
  try {
    const tweetId = req.params.tweetId;
    const userId = req.user.id;
    const tweet = await Tweets.findOne({ _id: tweetId });
    const count = tweet.Likes.filter((id) => {
      return id === userId;
    });
    if (count.length === 0) {
      await Tweets.updateOne(
        { _id: tweetId },
        { $push: { Likes: userId } }
      )
    } else {
      await Tweets.updateOne(
        { _id: tweetId },
        { $pull: { Likes: userId } }
      )
    }

    success = true;
    res.status(200).json(success);

  } catch (error) {
    success = false;
    console.log(error.message);
    res.status(500).send(success + "Internal server error");
  }
});

// Route-5: Repost a tweet using: POST,  Login required
router.post('/repost-tweet/:tweetId', fetchuser, async (req, res) => {
  try {
    const tweetId = req.params.tweetId;
    const userId = req.user.id;
    const user = await User.findOne({ _id: userId });
    const username = user.username;
    const name = user.name;
    const profileImage = user.image;
    const tweet = await Tweets.findOne({ _id: tweetId });
    const content = tweet.content;
    const image = tweet.image;
    const public_id = tweet.public_id;

    //Create a new tweet
    await Tweets.create({ userId: req.user.id, content, image, userImage: profileImage, username, name, public_id });
    await Tweets.updateOne(
      { _id: tweetId },
      { $push: { RepostBy: userId } }
    )
    res.status(200).json({ success: true });
  } catch (error) {
    success = false;
    console.log(error.message);
    res.status(500).send(success + "Internal server error");
  }
});

// Route-6: Delete a tweet using: DELETE,   Login required
router.delete('/delete-tweet', fetchuser, async (req, res) => {
  try {
    const tweetId = req.body.tweetId;
    const tweet = await Tweets.findOne({ _id: tweetId });
    const public_id = tweet.public_id;
    await Tweets.deleteOne({ _id: tweetId });
    if (public_id) {
      await deleteImage(public_id);
    }
    res.json({ success: true });
  } catch (error) {
    success = false;
    console.log(error.message);
    res.status(500).send(success + "Internal server error");
  }
});

// Route-7: Get tweet details: GET,   Login required
router.get('/get-tweet-details/:tweetId', fetchuser, async (req, res) => {
  try {
    const tweetId = req.params.tweetId;
    const tweet = await Tweets.findOne({ _id: tweetId });
    const tweetUserId = tweet.userId;
    const user = await User.findOne({ _id: tweetUserId });
    res.json({ user, tweet });
  } catch (error) {
    console.error(error);
  }
});

// Route-8: Retweet using: POST,   Login required
router.post('/retweet', fetchuser, async (req, res) => {
  try {
    const tweetId = req.body.tweetId;
    const tweetFilter = { _id: tweetId };
    const user = await User.findOne({ _id: req.user.id });

    if (req.body.imageUrl !== null) {
      console.log('image not null');
      //Push a new Retweet
      await Tweets.updateOne(
        { _id: tweetId },
        {
          $push: {
            RetweetBy: {
              userId: req.user.id,
              content: req.body.content,
              image: req.body.imageUrl,
              public_id: req.body.public_id,
              username: user.username,
              name: user.name,
              profileImage: user.image
            }
          }
        }
      );
      res.status(200).json({ success: true });
    } else {
      console.log('image null');
      //Push a new Retweet
      await Tweets.updateOne(
        tweetFilter,
        {
          $push: {
            RetweetBy: {
              userId: req.user.id,
              content: req.body.content,
              username: user.username,
              name: user.name,
              profileImage: user.image
            }
          }
        }
      );
      res.status(200).json({ success: true });
    }
  } catch (error) {
    console.error(error);
    res.json({ success: false });
  }
});

module.exports = router;