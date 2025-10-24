const express = require('express');
const { noteValidation } = require('../utils/validators');
const noteController = require('../controllers/noteController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.get('/:id/notes', noteController.getNotes);
router.post('/:id/notes', noteValidation, noteController.createNote);
router.delete('/:id/notes/:noteId', noteController.deleteNote);

module.exports = router;