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
          headers: {
            Authorization: `Bearer ${token}`,
          },
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
        console.error('No token found in localStorage');
        setError('Utilisateur non authentifié. Veuillez vous connecter.');
        return;
      }
  
      if (planning.meetingNumber && planning.joinUrl) {
        console.log('Meeting already exists:', planning.meetingNumber);
        setMeetingDetails({
          meetingNumber: planning.meetingNumber,
          joinUrl: planning.joinUrl,
          password: planning.password,
        });
      } else {
        console.log('Creating new Zoom meeting...');
        const response = await axios.post(
          'http://localhost:5000/api/zoom/create-meeting',
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log('Zoom API response:', response.data);
        const { meetingNumber, joinUrl, password } = response.data;
        console.log('Zoom meeting created:', { meetingNumber, joinUrl, password });
  
        console.log('Updating planning with meeting details...');
        const updateResponse = await axios.put(
          `http://localhost:5000/api/plannings/${planning.id}`,
          {
            meetingNumber,
            joinUrl,
            password,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log('Planning update response:', updateResponse.data);
  
        setMeetingDetails({ meetingNumber, joinUrl, password });
      }
  
      console.log('Updating planning status to "En cours"...');
      const statusResponse = await axios.put(
        `http://localhost:5000/api/plannings/${planning.id}/status`,
        {
          statut: 'En cours',
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log('Status update response:', statusResponse.data);
  
      console.log('Setting selected planning and opening modal...');
      setSelectedPlanning(planning);
      setShowModal(true);
    } catch (err) {
      console.error('Erreur lors de la création de la réunion:', err.response?.data || err.message);
      setError('Impossible de créer la réunion Zoom. Vérifiez vos identifiants Zoom ou contactez l\'administrateur.');
    }
  };
  const joinMeeting = async () => {
    try {
      const { joinUrl } = meetingDetails;
      console.log('Redirecting to Zoom meeting:', joinUrl);
      window.open(joinUrl, '_blank');
    } catch (err) {
      console.error('Erreur lors de la redirection vers la réunion Zoom:', err);
      setError('Impossible de rejoindre la réunion.');
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
        components={{
          event: EventComponent,
        }}
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
              {meetingDetails && (
                <div>
                  <p><strong>Lien de la réunion :</strong> <a href={meetingDetails.joinUrl} target="_blank" rel="noopener noreferrer">{meetingDetails.joinUrl}</a></p>
                  <p><strong>Numéro de la réunion :</strong> {meetingDetails.meetingNumber}</p>
                  <p><strong>Mot de passe :</strong> {meetingDetails.password}</p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                Annuler
              </button>
              <button className="btn btn-primary" onClick={joinMeeting}>
                Rejoindre la réunion
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherCalendar;