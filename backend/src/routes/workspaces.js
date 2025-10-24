const express = require('express');
const { workspaceValidation } = require('../utils/validators');
const workspaceController = require('../controllers/workspaceController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.get('/', workspaceController.getWorkspaces);
router.post('/', workspaceValidation, workspaceController.createWorkspace);
router.get('/:id', workspaceController.getWorkspace);
router.post('/:id/invite', workspaceController.inviteMember);
router.post('/:id/accept', workspaceController.acceptInvitation);

module.exports = router;