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
    const accessToken = response.data.access_token;
    const scopes = response.data.scope;
    console.log('Access token scopes:', scopes);
    return accessToken;
  } catch (error) {
    console.error('Erreur lors de la génération du token Zoom:', error.response?.data || error.message);
    throw new Error('Échec de la génération du token Zoom: ' + (error.response?.data?.message || error.message));
  }
};

const createZoomMeeting = async (zoomUserId) => {
  try {
    const accessToken = await getZoomAccessToken();
    console.log('Zoom access token obtained:', accessToken);

    const payload = {
      topic: 'Online Class Meeting',
      type: 2, // Scheduled meeting
      settings: {
        host_video: true,
        participant_video: false,
        join_before_host: true,
        mute_upon_entry: true,
        waiting_room: false,
        meeting_authentication: false,
        auto_recording: 'none',
        enforce_login: false,
        allow_multiple_devices: true,
      },
    };

    console.log('Creating meeting with payload:', payload);

    const response = await axios.post(
      `https://api.zoom.us/v2/users/${zoomUserId}/meetings`, // Use zoomUserId instead of 'me'
      payload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Zoom meeting created successfully:', response.data);

    return {
      meetingNumber: response.data.id.toString(),
      password: response.data.encrypted_password,
      joinUrl: response.data.join_url,
      startUrl: response.data.start_url,
    };
  } catch (error) {
    console.error('Error creating Zoom meeting:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers,
    });
    throw new Error('Échec de la création de la réunion Zoom: ' + (error.response?.data?.message || error.message));
  }
};
const getMeetingParticipants = async (meetingId, isOngoing = true) => {
  try {
    const accessToken = await getZoomAccessToken();

    let response;
    if (isOngoing) {
      try {
        response = await axios.get(
          `https://api.zoom.us/v2/metrics/meetings/${meetingId}/participants`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        console.log('Ongoing meeting participants (Dashboard API):', response.data);
        return response.data.participants || [];
      } catch (dashboardError) {
        console.warn('Dashboard API failed, falling back to Report API:', dashboardError.response?.data || dashboardError.message);
        response = await axios.get(
          `https://api.zoom.us/v2/report/meetings/${meetingId}/participants`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        console.log('Meeting participants (Report API):', response.data);
        return response.data.participants || [];
      }
    } else {
      response = await axios.get(
        `https://api.zoom.us/v2/report/meetings/${meetingId}/participants`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      console.log('Meeting participants (Report API):', response.data);
      return response.data.participants || [];
    }
  } catch (error) {
    console.error('Error fetching meeting participants:', error.response?.data || error.message);
    throw new Error('Échec de la récupération des participants: ' + (error.response?.data?.message || error.message));
  }
};

const getMeetingDetails = async (meetingId) => {
  try {
    const accessToken = await getZoomAccessToken();
    const response = await axios.get(
      `https://api.zoom.us/v2/meetings/${meetingId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    console.log('Meeting details:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching meeting details:', error.response?.data || error.message);
    throw new Error('Échec de la récupération des détails de la réunion: ' + (error.response?.data?.message || error.message));
  }
};

const endZoomMeeting = async (meetingId) => {
  try {
    const accessToken = await getZoomAccessToken();
    console.log('Ending Zoom meeting:', meetingId);

    await axios.patch(
      `https://api.zoom.us/v2/meetings/${meetingId}/status`,
      { status: 'end' },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Zoom meeting ended successfully');
    return true;
  } catch (error) {
    console.error('Error ending Zoom meeting:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw new Error('Échec de la fin de la réunion Zoom: ' + (error.response?.data?.message || error.message));
  }
};

module.exports = { createZoomMeeting, getMeetingParticipants, getMeetingDetails, endZoomMeeting };