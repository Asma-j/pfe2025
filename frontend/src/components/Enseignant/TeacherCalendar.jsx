import React, { useState, useEffect, forwardRef } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import axios from 'axios';
import './teacherCalendar.css';

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
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Utilisateur non authentifié. Veuillez vous connecter.');
      }

      let meetingDetails;
      if (planning.meetingNumber && planning.joinUrl) {
        meetingDetails = {
          meetingNumber: planning.meetingNumber,
          joinUrl: planning.joinUrl,
          password: planning.password,
        };
      } else {
        const response = await axios.post(
          'http://localhost:5000/api/zoom/create-meeting',
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        meetingDetails = response.data;

        await axios.put(
          `http://localhost:5000/api/plannings/${planning.id}`,
          meetingDetails,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      await axios.put(
        `http://localhost:5000/api/plannings/${planning.id}/status`,
        { statut: 'En cours' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

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
      await axios.post(
        `http://localhost:5000/api/zoom/end-meeting/${meetingId}`,
        { planningId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
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
      <div ref={ref} className="d-flex flex-column">
        <span className="mb-1">{event.title}</span>
        <button
          className={`event-button text-white ${!enabled ? 'disabled' : ''}`}
          disabled={!enabled}
          onClick={() => startMeeting(event.resource)}
        >
          Démarrer la réunion
        </button>
      </div>
    );
  });

  return (
    <div className="calendar-container">
      <div className="calendar-card">
        <h5 className="calendar-title">Emploi du temps</h5>
        {error && (
          <div className="error-alert">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-11a1 1 0 112 0v4a1 1 0 11-2 0V7zm1 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}
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
                style = { backgroundColor: '#3b82f6', borderColor: '#2563eb' };
                break;
              case 'En cours':
                style = { backgroundColor: '#f59e0b', borderColor: '#d97706' };
                break;
              case 'Terminé':
                style = { backgroundColor: '#10b981', borderColor: '#059669' };
                break;
              case 'Annulé':
                style = { backgroundColor: '#ef4444', borderColor: '#dc2626' };
                break;
              default:
                style = { backgroundColor: '#6b7280', borderColor: '#4b5563' };
            }
            return { style };
          }}
          components={{ event: EventComponent }}
        />
      </div>

      <div className={`modal fade ${showModal ? 'show' : ''} modal-custom`} style={{ display: showModal ? 'block' : 'none' }}>
        <div className="modal-dialog modal-dialog-centered">
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
                  <p><strong>Lien de la réunion :</strong> <a href={meetingDetails.joinUrl} target="_blank" rel="noopener noreferrer" className="text-primary">{meetingDetails.joinUrl}</a></p>
                  <p><strong>Numéro de la réunion :</strong> {meetingDetails.meetingNumber}</p>
                  <p><strong>Mot de passe :</strong> {meetingDetails.password}</p>
                </div>
              ) : (
                <p>Chargement des détails de la réunion...</p>
              )}
            </div>
            <div className="modal-footer">
              <button className="modal-btn btn btn-secondary" onClick={() => setShowModal(false)}>
                Annuler
              </button>
              <button className="modal-btn modal-btn-primary btn btn-primary" onClick={() => joinMeeting(meetingDetails)}>
                Rejoindre la réunion
              </button>
              {meetingDetails && selectedPlanning?.statut === 'En cours' && (
                <button
                  className="modal-btn modal-btn-danger btn btn-danger"
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