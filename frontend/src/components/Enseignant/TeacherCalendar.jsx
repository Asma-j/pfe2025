import React, { useState, useEffect, forwardRef } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import axios from 'axios';

const localizer = momentLocalizer(moment);

const TeacherCalendar = () => {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedPlanning, setSelectedPlanning] = useState(null);
  const [meetingDetails, setMeetingDetails] = useState(null);

  useEffect(() => {
    const fetchPlannings = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/plannings', {
          params: { include: 'Cours,Classe' },
          headers: { Authorization: `Bearer ${token}` },
        });

        const calendarEvents = response.data.map((planning) => ({
          title: `${planning.titre} (${planning.Cours?.titre || 'Cours inconnu'} - ${planning.Classe?.nom || 'Classe inconnue'} - Enseignant: ${planning.Cours?.Creator?.nom || 'Inconnu'})`,
          start: new Date(planning.date_debut),
          end: new Date(planning.date_fin),
          allDay: false,
          resource: planning,
        }));

        setEvents(calendarEvents);
      } catch (err) {
        console.error('Erreur lors de la récupération des plannings:', err);
        setError('Impossible de charger les plannings.');
      }
    };

    fetchPlannings();
  }, []);

  const isMeetingButtonEnabled = (planning) => {
    const now = moment();
    const start = moment(planning.date_debut);
    const diffMinutes = now.diff(start, 'minutes');
    return diffMinutes >= -10 && now.isBefore(moment(planning.date_fin));
  };

  const startMeeting = async (planning) => {
    try {
      console.log('Starting meeting for planning:', planning);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Utilisateur non authentifié. Veuillez vous connecter.');
      }

      let meetingDetails;
      if (planning.meetingNumber && planning.joinUrl) {
        console.log('Using existing meeting details:', planning.meetingNumber);
        meetingDetails = {
          meetingNumber: planning.meetingNumber,
          joinUrl: planning.joinUrl,
          password: planning.password,
        };
      } else {
        console.log('Creating new Zoom meeting...');
        const response = await axios.post(
          'http://localhost:5000/api/zoom/create-meeting',
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('Zoom API response:', response.data);
        meetingDetails = response.data;

        console.log('Updating planning with meeting details:', meetingDetails);
        const updateResponse = await axios.put(
          `http://localhost:5000/api/plannings/${planning.id}`,
          meetingDetails,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('Planning update response:', updateResponse.data);
      }

      console.log('Updating planning status to "En cours"...');
      const statusResponse = await axios.put(
        `http://localhost:5000/api/plannings/${planning.id}/status`,
        { statut: 'En cours' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Status update response:', statusResponse.data);

      setMeetingDetails(meetingDetails);
      setSelectedPlanning(planning);
      setShowModal(true);

      await joinMeeting(meetingDetails);
    } catch (err) {
      console.error('Error starting meeting:', err.response?.data || err.message);
      const errorMessage = err.response?.data?.error || err.message;
      setError(`Impossible de créer la réunion Zoom: ${errorMessage}`);
    }
  };

  const endMeeting = async (meetingId, planningId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:5000/api/zoom/end-meeting/${meetingId}`,
        { planningId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Meeting ended:', response.data);
      setShowModal(false);
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.resource.id === planningId
            ? { ...event, resource: { ...event.resource, statut: 'Terminé' } }
            : event
        )
      );
    } catch (err) {
      console.error('Error ending meeting:', err.response?.data || err.message);
      setError(`Impossible de mettre fin à la réunion: ${err.response?.data?.message || err.message}`);
    }
  };

  const joinMeeting = async (meetingDetails) => {
    try {
      const { joinUrl, meetingNumber } = meetingDetails;
      if (!joinUrl) {
        throw new Error('Lien de réunion non disponible.');
      }
      console.log('Redirecting to Zoom meeting:', joinUrl);
      const newWindow = window.open(joinUrl, '_blank');
      if (!newWindow) {
        throw new Error('Échec de l\'ouverture de la réunion Zoom. Veuillez vérifier les paramètres de votre navigateur.');
      }
      setShowModal(false);

      setTimeout(async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get(
            `http://localhost:5000/api/zoom/meeting-participants/${meetingNumber}`,
            {
              headers: { Authorization: `Bearer ${token}` },
              params: { isOngoing: true },
            }
          );
          const participants = response.data.participants || [];
          if (participants.length === 0) {
            console.log('No participants found in the meeting yet');
          } else {
            console.log('Current meeting participants:', participants);
          }
        } catch (error) {
          console.error('Error fetching participants:', error.response?.data?.message || error.message);
        }
      }, 5000);
    } catch (err) {
      console.error('Erreur lors de la redirection vers la réunion Zoom:', err.message);
      setError('Impossible de rejoindre la réunion: ' + err.message);
    }
  };

  const EventComponent = forwardRef(({ event }, ref) => {
    const enabled = isMeetingButtonEnabled(event.resource);
    return (
      <div ref={ref}>
        <span>{event.title}</span>
        <div>
          <button
            className={`btn btn-primary btn-sm mt-1 ${!enabled ? 'disabled' : ''}`}
            disabled={!enabled}
            onClick={() => startMeeting(event.resource)}
          >
            Démarrer la réunion
          </button>
        </div>
      </div>
    );
  });

  return (
    <div className="card p-3">
      <h5>Emploi du temps</h5>
      {error && <div className="alert alert-danger">{error}</div>}
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
        eventPropGetter={(event) => {
          let style = {};
          switch (event.resource.statut) {
            case 'Planifié':
              style = { backgroundColor: '#007bff', borderColor: '#0056b3' };
              break;
            case 'En cours':
              style = { backgroundColor: '#ffc107', borderColor: '#e0a800' };
              break;
            case 'Terminé':
              style = { backgroundColor: '#28a745', borderColor: '#218838' };
              break;
            case 'Annulé':
              style = { backgroundColor: '#dc3545', borderColor: '#c82333' };
              break;
            default:
              style = { backgroundColor: '#6c757d', borderColor: '#5a6268' };
          }
          return { style };
        }}
        components={{ event: EventComponent }}
      />

      <div className={`modal ${showModal ? 'd-block' : 'd-none'}`} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Rejoindre la réunion</h5>
              <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
            </div>
            <div className="modal-body">
              <p>Vous êtes sur le point de rejoindre la réunion pour : <strong>{selectedPlanning?.titre}</strong></p>
              <p className="text-warning">
                Rappel : Veuillez activer l'option "Masquer les participants les uns des autres" dans Zoom pour que les étudiants ne voient que vous.
              </p>
              {meetingDetails ? (
                <div>
                  <p><strong>Lien de la réunion :</strong> <a href={meetingDetails.joinUrl} target="_blank" rel="noopener noreferrer">{meetingDetails.joinUrl}</a></p>
                  <p><strong>Numéro de la réunion :</strong> {meetingDetails.meetingNumber}</p>
                  <p><strong>Mot de passe :</strong> {meetingDetails.password}</p>
                </div>
              ) : (
                <p>Chargement des détails de la réunion...</p>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                Annuler
              </button>
              <button className="btn btn-primary" onClick={() => joinMeeting(meetingDetails)}>
                Rejoindre la réunion
              </button>
              {meetingDetails && selectedPlanning?.statut === 'En cours' && (
                <button
                  className="btn btn-danger"
                  onClick={() => endMeeting(meetingDetails.meetingNumber, selectedPlanning.id)}
                >
                  Mettre fin à la réunion
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherCalendar;