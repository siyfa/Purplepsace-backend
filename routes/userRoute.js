import express from "express";
import bcrypt from "bcrypt";
//
import User from "../models/userModel.js";
import Notification from "../models/notificationModel.js";
import Post from "../models/postModel.js";

const router = express.Router();

//Update user
router.put("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    if (req.body.password) {
      try {
        if (req.body.password.length < 6) {
          res.status(406).json("Password is too short");
        }
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
      } catch (err) {
        res.status(500).json(err);
      }
    }
    try {
      const user = await User.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      });
      res.status(200).json("Account has been updated");
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    return res.status(403).json("You can only update your account");
  }
});

//delete user
router.delete("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      const user = await User.deleteOne({ _id: req.params.id });
      res.status(200).json("Account has been deleted succesfully");
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    return res.status(403).json("You can only delete your account");
  }
});

//get a user
router.get("/", async (req, res) => {
  const userId = req.query.userId;
  try {
    const userName = req.query.username;
    const user = userId
      ? await User.findById(userId).populate("notifications")
      : await User.findOne({ username: userName });
    let userGotten = [];
    const unRead = user.notifications.filter((n) => n.isRead !== true);
    const {
      profilePicture,
      coverPicture,
      followers,
      followings,
      _id,
      bio,
      isAdmin,
      name,
      username,
      city,
      country,
      dob,
      phoneNumber,
      email,
      createdAt,
    } = user;
    userGotten.push({
      profilePicture,
      coverPicture,
      followers,
      followings,
      username,
      _id,
      isAdmin,
      bio,
      isAdmin,
      name,
      city,
      country,
      dob,
      phoneNumber,
      email,
      createdAt,
      unRead,
    });
    res.status(200).json(userGotten);
  } catch (err) {
    res.status(500).json(err);
  }
});
//get following friends
router.get("/friends/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    const friends = await Promise.all(
      user.followings.map((friendId) => {
        return User.findById(friendId);
      })
    );
    let friendList = [];
    friends.map((friend) => {
      const { _id, username, profilePicture } = friend;
      friendList.push({ _id, username, profilePicture });
    });
    res.status(200).json(friendList);
  } catch (err) {
    res.status(500).json(err);
  }
});
//get follower friends
router.get("/followers/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    const friends = await Promise.all(
      user.followers.map((friendId) => {
        return User.findById(friendId);
      })
    );
    let friendList = [];
    friends.map((friend) => {
      const { _id, username, profilePicture } = friend;
      friendList.push({ _id, username, profilePicture });
    });
    res.status(200).json(friendList);
  } catch (err) {
    res.status(500).json(err);
  }
});
//folow a user
router.put("/:id/follow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      const newNotication = new Notification({
        username: currentUser.username,
        profilePicture: currentUser.profilePicture,
        type: "followed you",
        typeId: currentUser._id,
      });
      if (!user.followers.includes(req.body.userId)) {
        await user.updateOne({ $push: { followers: req.body.userId } });
        await currentUser.updateOne({ $push: { followings: req.params.id } });
        await user.notifications.push(newNotication);
        await newNotication.save();
        await user.save();
        res.status(200).json("User has been followed");
      } else {
        res.status(403).json("You already follow this user");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("You can't follow yourself. Ko possible!");
  }
});
//unfolow a user
router.put("/:id/unfollow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (user.followers.includes(req.body.userId)) {
        await user.updateOne({ $pull: { followers: req.body.userId } });
        await currentUser.updateOne({ $pull: { followings: req.params.id } });
        res.status(200).json("User has been unfollowed");
      } else {
        res.status(403).json("You ain't following this user");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("You can't unfollow yourself. Ko possible!");
  }
});
//user suggestions
router.get("/:id/suggestions", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).json("User is not found");
    }
    const users = await User.find();
    const allUsers = users.map((user) => {
      return user._id;
    });
    const suggestedUsers = allUsers.filter((u) => u != req.params.id);
    const followings = user.followings;
    let tempArray = suggestedUsers.filter((user) => !followings.includes(user));
    const suggestions = await Promise.all(
      tempArray.map((id) => {
        return User.findById(id);
      })
    );
    let suggestionList = [];
    suggestions.map((suggestion) => {
      const { _id, username, profilePicture, bio, name } = suggestion;
      suggestionList.push({ _id, username, profilePicture, bio, name });
    });
    res.status(200).json(suggestionList);
  } catch (err) {
    res.status(500).json(err);
  }
});
//get notifications
router.get("/:id/notifications", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate("notifications");
    if (user) {
      const notifications = user.notifications.reverse();
      notifications.map((n) => {
        n.isRead = true;
        return n.save();
      });
      res.status(200).json(notifications);
    } else {
      res.status(404).json("User doesn't exist");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

export default router;
