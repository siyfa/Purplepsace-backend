import express from "express";
import Post from "../models/postModel.js";
import User from "../models/userModel.js";
import Comment from "../models/commentModel.js";
import Notification from "../models/notificationModel.js";
//
const router = express.Router();

//post a post
router.post("/new", async (req, res) => {
  const { userId, desc, image } = req.body;
  try {
    const user = await User.findOne({ _id: userId });
    if (!user) {
      res.status(404).json("User not found. Unauthorize request");
    }
    if (!userId || !desc) {
      return res.status(502).json("All feilds are required");
    }
    const newPost = new Post({ userId, desc, image });
    const newNotication = new Notification({
      username: user.username,
      profilePicture: user.profilePicture,
      type: "shared a new thought",
      typeId: newPost._id,
    });
    const followers = await Promise.all(
      user.followers.map((userId) => {
        return User.findById(userId);
      })
    );
    const follower = followers.map((user) => {
      user.notifications.push(newNotication);
      newNotication.save();
      user.save();
    });
    await newPost.save();
    res.status(200).json(newPost);
  } catch (err) {
    res.status(500).json(err);
  }
});
//update a post
router.put("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.updateOne({ $set: req.body });
      res.status(200).json("Post has been updated succesfully");
    } else {
      res.status(403).json("You can't update this post.");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});
//delet a post
router.delete("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post) {
      await post.deleteOne();
      res.status(200).json("Post has been deleted succesfully");
    } else {
      res.status(403).json("You can't delete this post.");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

//like a post
router.put("/:id/like", async (req, res) => {
  const { userId } = req.body;
  try {
    const currentUser = await User.findOne({ _id: userId });
    if (!currentUser) {
      res.status(403).json("User authorized request denied");
    }
    const post = await Post.findById(req.params.id);
    const ownerUser = await User.findById(post.userId);
    if (!post.likes.includes(req.body.userId)) {
      const newNotication = new Notification({
        username: currentUser.username,
        profilePicture: currentUser.profilePicture,
        type: "liked your post",
        typeId: post._id,
      });
      await post.updateOne({ $push: { likes: req.body.userId } });
      const onwerId = JSON.stringify(ownerUser._id);
      const userId = JSON.stringify(currentUser._id);
      if (onwerId !== userId) {
        await ownerUser.notifications.push(newNotication);
        await newNotication.save();
        await ownerUser.save();
      }
      res.status(200).json("The post has been liked");
    } else {
      await post.updateOne({ $pull: { likes: req.body.userId } });
      res.status(200).json("The post has been disliked");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});
//get a post
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate("comments");
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json(err);
  }
});
//get timeline post
router.get("/timeline/:userId", async (req, res) => {
  try {
    const cuurentUser = await User.findById(req.params.userId);
    const userPosts = await Post.find({ userId: req.params.userId });
    let friends = [];
    const followingPosts = await Promise.all(
      cuurentUser.followings.map((friendId) => {
        friends.push(friendId);
        // return Post.find({ userId: friendId });
      })
    );
    const followersPosts = await Promise.all(
      cuurentUser.followers.map((friendId) => {
        friends.push(friendId);
        // return Post.find({ userId: friendId });
      })
    );
    const uniqPosts = friends.filter((data, index) => {
      return friends.indexOf(data) === index;
    });
    const FriendsPosts = await Promise.all(
      uniqPosts.map((id) => {
        return Post.find({ userId: id });
      })
    );
    res.status(200).json(userPosts.concat(...FriendsPosts));
  } catch (err) {
    res.status(500).json(err);
  }
});
//get user posts
router.get("/profile/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    const posts = await Post.find({ userId: user._id });
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json(err);
  }
});
//post comment
router.post("/:postId/comments", async (req, res) => {
  try {
    const userId = req.body.userId;
    const user = await User.findById(userId);
    if (user) {
      const post = await Post.findById(req.params.postId);
      const ownerUser = await User.findById(post.userId);
      const newComment = new Comment({
        text: req.body.text,
        user: {
          id: user._id,
          profilePicture: user.profilePicture,
          username: user.username,
        },
      });
      const commentNotication = new Notification({
        username: user.username,
        profilePicture: user.profilePicture,
        type: "commented on your post",
        typeId: post._id,
      });
      const onwerId = JSON.stringify(ownerUser._id);
      const userId = JSON.stringify(user._id);
      if (post) {
        if (onwerId !== userId) {
          await ownerUser.notifications.push(commentNotication);
          await commentNotication.save();
          await ownerUser.save();
        }
        await newComment.save();
        await post.comments.push(newComment);
        await post.save();
        res.status(201).json(newComment);
      } else {
        res.status(404).json("Post not found.");
      }
    } else {
      res.status(404).json("User not found. You can't comment on this post");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

export default router;
