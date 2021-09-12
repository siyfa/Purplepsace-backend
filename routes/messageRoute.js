import express from "express";
import Post from "../models/postModel.js";
import User from "../models/userModel.js";
import Message from "../models/messageModel.js";
//
const router = express.Router();

//new
router.post("/", async (req, res) => {
  const newMessage = new Message(req.body);

  try {
    const saveMessage = await newMessage.save();
    res.status(200).json(saveMessage);
  } catch (err) {
    res.status(500).json(err);
  }
});

//get
router.get("/:conversationId", async (req, res) => {
  try {
    const wholeMessage = await Message.find({
      conversationId: req.params.conversationId,
    });
    res.status(200).json(wholeMessage);
    // res.status(200).json(saveMessage);
  } catch (err) {
    res.status(500).json(err);
  }
});

export default router;
