// routes/messageRoutes.js
const express = require("express");
const multer = require("multer");
const path = require("path");
const Message = require("../../models/message");

const router = express.Router();
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

router.post("/", upload.single("file"), async (req, res) => {
  const { senderId, receiverId, message } = req.body;
  const fileUrl = req.file ? req.file.path : null;

  const newMsg = new Message({ senderId, receiverId, message, fileUrl });
  await newMsg.save();
  res.json(newMsg);
});

module.exports = router;
