const { validationResult } = require('express-validator');
const Workspace = require('../models/Workspace');
const User = require('../models/User');
const Note = require('../models/Note');
const { sendToUser } = require('../services/socketService');

exports.getWorkspaces = async (req,  res) => {
  try {
    const workspaces = await Workspace.find({
      members: req.user.id
    })
    .populate('createdBy', 'name email')
    .select('name description createdAt createdBy')
    .sort({ createdAt: -1 });
 
    res.json(workspaces);
  } catch (error) {
    console.error('Get workspaces error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createWorkspace = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description } = req.body;

   

    const workspace = await Workspace.create({
      name,
      description,
      createdBy: req.user.id,
      members: [req.user.id]
    });

    const populatedWorkspace = await Workspace.findById(workspace._id)
      .populate('createdBy', 'name email')
      .populate('members', 'name email');

  

    res.status(201).json(populatedWorkspace);
  } catch (error) {
    console.error('Create workspace error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getWorkspace = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id.toString();

    // console.log(` Getting workspace ${id} for user ${userId}`);

    const workspace = await Workspace.findById(id)
      .populate('createdBy', 'name email')
      .populate('members', 'name email');

    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // console.log(`   Workspace: ${workspace.name}`);
    // console.log(`   Members count: ${workspace.members.length}`);
    
    // Check if user is a member - convert ObjectIds to strings for comparison
    const isMember = workspace.members.some(member => {
      const memberId = member._id.toString();
      // console.log(`   Checking: ${memberId} === ${userId} ? ${memberId === userId}`);
      return memberId === userId;
    });

    if (!isMember) {
      console.log(`Access denied - User ${userId} is not a member`);
      return res.status(403).json({ message: 'Access denied - You are not a member of this workspace' });
    }

    // console.log('Access granted');

    const notes = await Note.find({ workspaceId: id })
      .populate('lastEditedBy', 'name email')
      .sort({ lastEditedAt: -1 });

    res.json({ workspace, notes });
  } catch (error) {
    console.error('Get workspace error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.inviteMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;
    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    const workspace = await Workspace.findById(id)
      .populate('createdBy', 'name email')
      .populate('members', 'name email');

    if (!workspace) {
      console.log(' Workspace not found');
      return res.status(404).json({ message: 'Workspace not found' });
    }
    // Check if requester is a member
    const requesterId = req.user.id.toString();
    const isMember = workspace.members.some(m => m._id.toString() === requesterId);
    
    if (!isMember) {
      console.log(` Requester ${requesterId} is not a member`);
      return res.status(403).json({ message: 'You must be a member to invite others' });
    }

    // Find user to invite
    const userToInvite = await User.findOne({ email: normalizedEmail });
    
    if (!userToInvite) {
      return res.status(404).json({ message: 'No user found with this email address' });
    }

    const invitedUserId = userToInvite._id.toString();
    // console.log(`   Found user: ${userToInvite.name} (${invitedUserId})`);

    // Check if user is already a member
    const isAlreadyMember = workspace.members.some(m => {
      const memberId = m._id.toString();
      // console.log(`   Checking member: ${memberId} === ${invitedUserId} ? ${memberId === invitedUserId}`);
      return memberId === invitedUserId;
    });
    
    if (isAlreadyMember) {
      console.log(' User is already a member');
      return res.status(400).json({ 
        message: `${userToInvite.name} is already a member of this workspace` 
      });
    }
    // Send socket notification to the specific invited user
    const invitationData = {
      workspace: {
        _id: workspace._id.toString(),
        name: workspace.name,
        description: workspace.description
      },
      invitedUserId: invitedUserId,
      invitedUserEmail: userToInvite.email,
      invitedBy: req.user.name,
      invitedById: req.user.id,
      workspaceId: id,
      timestamp: new Date().toISOString()
    };

   
    
    sendToUser(invitedUserId, 'workspace.invitation', invitationData);

    res.json({ 
      message: 'Invitation sent successfully',
      invitedUser: { 
        id: userToInvite._id, 
        name: userToInvite.name, 
        email: userToInvite.email 
      }
    });
  } catch (error) {
    console.error(' Invite member error:', error);
    res.status(500).json({ message: 'Server error', details: error.message });
  }
};

exports.acceptInvitation = async (req, res) => {
  try {
    const { id } = req.params; // workspace id
    const userId = req.user.id.toString();

    // console.log(`\n Processing invitation acceptance`);
    // console.log(`   Workspace ID: ${id}`);
    // console.log(`   User ID: ${userId}`);
    // console.log(`   User: ${req.user.name} (${req.user.email})`);

    // Find the workspace with lean() for better performance
    const workspace = await Workspace.findById(id);
    
    if (!workspace) {
      console.log('Workspace not found');
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // console.log(`   Workspace: ${workspace.name}`);
    // console.log(`   Current members: ${workspace.members.length}`);

    // Check if user is already a member
    const isAlreadyMember = workspace.members.some(memberId => {
      const mId = memberId.toString();
      // console.log(`Checking: ${mId} === ${userId} ? ${mId === userId}`);
      return mId === userId;
    });
    
    if (isAlreadyMember) {
      console.log('⚠️ User is already a member of this workspace');
      return res.status(200).json({ 
        message: 'You are already a member of this workspace',
        alreadyMember: true
      });
    }

    // Add user to workspace members
    workspace.members.push(userId);
    await workspace.save();

    // console.log(` User added to workspace`);
    // console.log(`   New member count: ${workspace.members.length}`);

    // Get populated workspace
    const populatedWorkspace = await Workspace.findById(id)
      .populate('createdBy', 'name email')
      .populate('members', 'name email');

    // Notify all members in the workspace about the new member
    const io = req.app.get('io');
    if (io) {
      io.to(`workspace:${id}`).emit('member.joined', {
        workspace: populatedWorkspace,
        newMember: {
          id: req.user.id,
          name: req.user.name,
          email: req.user.email
        }
      });
      // console.log(`Broadcasted member.joined event to workspace`);
    }

    res.json({ 
      message: 'Successfully joined the workspace',
      workspace: populatedWorkspace 
    });
  } catch (error) {
    console.error(' Accept invitation error:', error);
    res.status(500).json({ message: 'Server error', details: error.message });
  }
};