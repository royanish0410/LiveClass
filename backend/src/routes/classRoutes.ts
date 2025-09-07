import express from 'express';
import ClassModel from '../models/Class';
import { createRoom } from '../utils/livekit';

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

    // Use newClass.id to safely get string representation of _id
    await createRoom(newClass.id);

    res.status(201).json({ message: 'Class created', classId: newClass.id });
  } catch (error) {
    console.error('Error creating class:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
