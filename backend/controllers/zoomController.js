const axios = require('axios');
const qs = require('qs');
require('dotenv').config();

const getZoomAccessToken = async () => {
  try {
    const response = await axios.post(
      'https://zoom.us/oauth/token',
      qs.stringify({
        grant_type: 'account_credentials',
        account_id: process.env.ZOOM_ACCOUNT_ID,
      }),
      {
        headers: {
          Authorization: `Basic ${Buffer.from(`${process.env.ZOOM_API_KEY}:${process.env.ZOOM_API_SECRET}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    return response.data.access_token;
  } catch (error) {
    console.error('Erreur lors de la génération du token Zoom:', error.response?.data || error.message);
    throw new Error('Échec de la génération du token Zoom');
  }
};

const createZoomMeeting = async () => {
  try {
    const accessToken = await getZoomAccessToken();
    const response = await axios.post(
      'https://api.zoom.us/v2/users/me/meetings',
      {
        topic: 'Online Class Meeting',
        type: 2, // Scheduled meeting
        settings: {
          host_video: true,
          participant_video: true,
          join_before_host: false,
          mute_upon_entry: true,
          waiting_room: true,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      meetingNumber: response.data.id.toString(),
      password: response.data.encrypted_password,
      joinUrl: response.data.join_url,
    };
  } catch (error) {
    console.error('Erreur lors de la création de la réunion Zoom:', error.response?.data || error.message);
    throw new Error('Échec de la création de la réunion Zoom');
  }
};

module.exports = { createZoomMeeting };