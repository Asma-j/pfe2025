const express = require('express');
const router = express.Router();
const { createZoomMeeting } = require('../controllers/zoomController');
const authMiddleware = require('../middleware/auth');

router.post('/create-meeting', authMiddleware, async (req, res) => {
  try {
    const meetingDetails = await createZoomMeeting();
    res.status(200).json(meetingDetails);
  } catch (error) {
    res.status(500).json({ message: 'Error creating Zoom meeting', error: error.message });
  }
});

module.exports = router;