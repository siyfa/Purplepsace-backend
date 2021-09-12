import express from "express";
import bcrypt from "bcrypt";

//
import User from "../models/userModel.js";

const router = express.Router();

//Register User
router.post("/register", async (req, res) => {
  try {
    const { username, name, email, password, confirmPassword } = req.body;
    // if ((!username, !email, !password, !name)) {
    //   return res.status(406).json("All fields are required");
    // }
    // if (password !== confirmPassword) {
    //   return res
    //     .status(406)
    //     .json("Passwords don't match, Please confirm your passwords again");
    // }
    // if (password.length < 6) {
    //   return res.status(406).json("Password is too short");
    // }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    await User.findOne({ username }).then((user) => {
      if (user) {
        return res.status(501).json("Username not available");
      }
    });
    await User.findOne({ email }).then(async (user) => {
      if (user) {
        return res.status(502).json("User with this email already exist");
      } else {
        const newUser = await new User({
          username: username,
          email: email,
          name: name,
          password: hashedPassword,
        });
        //save user
        await newUser.save();
        return res.status(201).json(newUser);
      }
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

//Login user
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if ((!username, !password)) {
      res.status(406).json("All fields are required");
    }
    const user = await User.findOne({ username }).populate("notifications");
    !user && res.status(404).json("User not found");

    const validPassword = await bcrypt.compare(password, user.password);
    !validPassword && res.status(400).json("Wrong password");

    let loginUser = [];
    const {
      profilePicture,
      coverPicture,
      followers,
      followings,
      _id,
      bio,
      isAdmin,
      name,
      city,
      country,
      dob,
      phoneNumber,
      email,
      createdAt,
    } = user;
    loginUser.push({
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
    });

    res.status(200).json(loginUser);
  } catch (err) {
    res.status(500).json(err);
  }
});

export default router;
