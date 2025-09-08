import express from 'express';
import ClassModel from '../models/Class';
import { createRoom, generateToken } from '../utils/livekit';

const router = express.Router();

// Create a new class
router.post('/classes', async (req, res) => {
  try {
    const { name, maxParticipants } = req.body;
    if (!name || !maxParticipants) {
      return res.status(400).json({ error: 'Name and maxParticipants are required' });
    }

    const newClass = new ClassModel({
      name,
      maxParticipants,
      waitlist: [],
      participants: [],
      isActive: false,
    });

    await newClass.save();

    await createRoom(newClass.id);

    res.status(201).json({ message: 'Class created', classId: newClass.id });
  } catch (error) {
    console.error('Error creating class:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Start the class
router.post('/classes/:id/start', async (req, res) => {
  try {
    const classId = req.params.id;

    const foundClass = await ClassModel.findById(classId);
    if (!foundClass) {
      return res.status(404).json({ error: 'Class not found' });
    }

    if (foundClass.isActive) {
      return res.status(400).json({ error: 'Class already active' });
    }

    foundClass.isActive = true;
    await foundClass.save();

    res.status(200).json({ message: 'Class started', class: foundClass });
  } catch (error) {
    console.error('Error starting class:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Stop the class
router.post('/classes/:id/stop', async (req, res) => {
  try {
    const classId = req.params.id;

    const foundClass = await ClassModel.findById(classId);
    if (!foundClass) {
      return res.status(404).json({ error: 'Class not found' });
    }

    if (!foundClass.isActive) {
      return res.status(400).json({ error: 'Class already inactive' });
    }

    foundClass.isActive = false;
    await foundClass.save();

    res.status(200).json({ message: 'Class stopped', class: foundClass });
  } catch (error) {
    console.error('Error stopping class:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Join the class
router.post('/classes/:id/join', async (req, res) => {
  try {
    const classId = req.params.id;
    const { identity } = req.body;

    if (!identity) {
      return res.status(400).json({ error: 'Identity is required' });
    }

    const foundClass = await ClassModel.findById(classId);
    if (!foundClass) {
      return res.status(404).json({ error: 'Class not found' });
    }

    if (!foundClass.isActive) {
      return res.status(400).json({ error: 'Class is not active' });
    }

    if (foundClass.participants.includes(identity)) {
      return res.status(400).json({ error: 'Already joined' });
    }

    if (foundClass.participants.length < foundClass.maxParticipants) {
      foundClass.participants.push(identity);
      await foundClass.save();

      const token = generateToken(classId, identity);

      return res.status(200).json({
        message: 'Joined class',
        token,
        joined: true,
      });
    } else {
      if (!foundClass.waitlist.includes(identity)) {
        foundClass.waitlist.push(identity);
        await foundClass.save();
      }

      return res.status(200).json({
        message: 'Class full, added to waitlist',
        joined: false,
      });
    }
  } catch (error) {
    console.error('Error joining class:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
