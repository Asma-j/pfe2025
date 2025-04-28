const express = require('express');
const router = express.Router();
const { createZoomMeeting, getMeetingParticipants, getMeetingDetails, endZoomMeeting } = require('../controllers/zoomController');
const authMiddleware = require('../middleware/auth');
const Utilisateur = require('../models/Utilisateur');
const Planning = require('../models/Planning');

// Route to create a Zoom meeting
router.post('/create-meeting', authMiddleware, async (req, res) => {
  try {
    const user = await Utilisateur.findByPk(req.user.id);
    if (!user.zoomUserId) {
      return res.status(400).json({ message: 'Zoom user ID not configured for this teacher' });
    }
    const meetingDetails = await createZoomMeeting(user.zoomUserId);
    res.status(200).json(meetingDetails);
  } catch (error) {
    console.error('Error creating Zoom meeting:', error);
    res.status(500).json({ message: 'Error creating Zoom meeting', error: error.message });
  }
});

// Route to end a Zoom meeting
router.post('/end-meeting/:meetingId', authMiddleware, async (req, res) => {
  try {
    const { meetingId } = req.params;
    const { planningId } = req.body;

    // Validate planningId
    if (!planningId) {
      return res.status(400).json({ message: 'Planning ID is required' });
    }

    // Find the planning
    const planning = await Planning.findByPk(planningId);
    if (!planning) {
      return res.status(404).json({ message: 'Planning non trouvé' });
    }

    // End the Zoom meeting
    await endZoomMeeting(meetingId);

    // Update planning status to 'Terminé' if not already
    if (planning.statut !== 'Terminé') {
      planning.statut = 'Terminé';
      await planning.save();
      console.log(`Planning ${planningId} status updated to Terminé`);
    } else {
      console.log(`Planning ${planningId} already Terminé`);
    }

    res.status(200).json({ message: 'Meeting ended and planning status updated to Terminé' });
  } catch (error) {
    console.error('Error ending Zoom meeting:', error);
    res.status(500).json({ message: 'Error ending Zoom meeting', error: error.message });
  }
});

// Route to get meeting participants
router.get('/meeting-participants/:meetingId', authMiddleware, async (req, res) => {
  try {
    const { meetingId } = req.params;
    const { isOngoing } = req.query;
    const participants = await getMeetingParticipants(meetingId, isOngoing === 'true');
    res.status(200).json({ participants });
  } catch (error) {
    console.error('Error fetching meeting participants:', error);
    res.status(500).json({ message: 'Error fetching meeting participants', error: error.message });
  }
});

// Route to get meeting details
router.get('/meeting-details/:meetingId', authMiddleware, async (req, res) => {
  try {
    const { meetingId } = req.params;
    const meetingDetails = await getMeetingDetails(meetingId);
    res.status(200).json(meetingDetails);
  } catch (error) {
    console.error('Error fetching meeting details:', error);
    res.status(500).json({ message: 'Error fetching meeting details', error: error.message });
  }
});

module.exports = router;