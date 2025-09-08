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

    // Note: `createRoom` is a placeholder. You don't need this for LiveKit cloud.
    // await createRoom(newClass.id);

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

    // --- The Correct Atomic Admission Logic ---
    const admittedClass = await ClassModel.findOneAndUpdate(
      { 
        _id: classId, 
        isActive: true,
        // Ensure user isn't already in participants or waitlist
        participants: { $nin: [identity] },
        waitlist: { $nin: [identity] },
        // This `$expr` check is the key to atomic concurrency. It
        // ensures the update only happens if the current participant
        // count is less than the max.
        $expr: { $lt: [{ $size: '$participants' }, '$maxParticipants'] }
      },
      { $push: { participants: identity } },
      { new: true } // Returns the document after the update
    );
    
    // Check if the student was admitted (the atomic operation was successful)
    if (admittedClass) {
      const token = generateToken(classId, identity);
      return res.status(200).json({
        message: 'Joined class',
        token,
        joined: true,
      });
    }

    // If the atomic operation failed, the class must be full or not active.
    const foundClass = await ClassModel.findById(classId);

    // Check if the class is not active or not found
    if (!foundClass || !foundClass.isActive) {
      return res.status(400).json({ error: 'Class is not active or not found' });
    }
    
    // Check if the user is already on the waitlist
    if (foundClass.waitlist.includes(identity)) {
        return res.status(200).json({ message: 'Already on waitlist', joined: false });
    }

    // Class is full, add to waitlist
    await ClassModel.findByIdAndUpdate(
      classId,
      { $push: { waitlist: identity } }
    );
    
    return res.status(200).json({
      message: 'Class full, added to waitlist',
      joined: false,
    });
  } catch (error) {
    console.error('Error joining class:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /classes/:id/events: Fetch all events for replay
router.get('/classes/:id/events', async (req, res) => {
    try {
        const classId = req.params.id;
        const foundClass = await ClassModel.findById(classId).select('whiteboardEvents chatEvents');

        if (!foundClass) {
            return res.status(404).json({ error: 'Class not found' });
        }

        // Combine and sort events by timestamp
        const events = [...foundClass.whiteboardEvents, ...foundClass.chatEvents]
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

        return res.status(200).json(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;