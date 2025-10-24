const { validationResult } = require('express-validator');
const Note = require('../models/Note');
const Workspace = require('../models/Workspace');

exports.getNotes = async (req, res) => {
  try {
    const { id: workspaceId } = req.params;

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace || !workspace.members.includes(req.user.id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const notes = await Note.find({ workspaceId })
      .populate('lastEditedBy', 'name email')
      .sort({ lastEditedAt: -1 });

    res.json(notes);
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createNote = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id: workspaceId } = req.params;
    const { title, content } = req.body;

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace || !workspace.members.includes(req.user.id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const note = await Note.create({
      workspaceId,
      title: title || 'Untitled',
      content: content || '',
      lastEditedBy: req.user.id
    });

    const populatedNote = await Note.findById(note._id)
      .populate('lastEditedBy', 'name email');

    res.status(201).json(populatedNote);
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteNote = async (req, res) => {
  try {
    const { id: workspaceId, noteId } = req.params;

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace || !workspace.members.includes(req.user.id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const note = await Note.findOneAndDelete({ 
      _id: noteId, 
      workspaceId 
    });

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};