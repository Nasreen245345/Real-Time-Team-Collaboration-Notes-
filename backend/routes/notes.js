// routes/notes.js
const express = require("express");
const router = express.Router();
const Note = require("../models/Notes.js");

// Create a note
router.post("/", async (req, res) => {
  try {
    const userId=req.user.id;
    const { workspaceId, title, content } = req.body;

    const note = await Note.create({
      workspaceId,
      title,
      content,
      lastEditedBy: userId,
    });

    // broadcast to others in workspace
    req.io.to(workspaceId).emit("noteCreated", note);

    res.status(201).json(note);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
