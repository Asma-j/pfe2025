import React from 'react';
import { FaUsers, FaClock, FaEllipsisV, FaPlus } from 'react-icons/fa';
import { Button, Card } from 'react-bootstrap';

const scheduleEvents = [
  {
    id: '1',
    title: 'Concepts Avancés en JavaScript',
    type: 'Conférence',
    time: '09:00 AM',
    duration: '2 heures',
    instructor: 'Dr. Alan Smith',
    participants: 45,
    badgeColor: 'bg-primary bg-opacity-10 text-primary',
  },
  {
    id: '2',
    title: 'Atelier de Recherche UX',
    type: 'Atelier',
    time: '11:30 AM',
    duration: '1,5 heure',
    instructor: 'Maria Garcia',
    participants: 25,
    badgeColor: 'bg-success bg-opacity-10 text-success',
  },
];

function ScheduleEvent({ event }) {
  return (
    <Card className="mb-3 border-0 shadow-sm rounded-3 p-3">
      <Card.Body className="d-flex align-items-center">
        {/* Heure */}
        <div className="text-center me-4">
          <p className="fw-bold text-primary display-6 mb-0">{event.time.split(' ')[0]}</p>
          <p className="text-muted small">{event.time.split(' ')[1]}</p>
        </div>

        {/* Détails de l'événement */}
        <div className="flex-grow-1">
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <h6 className="fw-bold mb-1">{event.title}</h6>
              <p className="text-muted small mb-2">{event.instructor}</p>
            </div>
            <span className={`badge rounded-pill px-3 py-1 ${event.badgeColor}`}>{event.type}</span>
          </div>
          <div className="mt-2 d-flex">
            <div className="d-flex align-items-center me-4 text-muted">
              <FaClock className="me-2" />
              <span className="small">{event.duration}</span>
            </div>
            <div className="d-flex align-items-center text-muted">
              <FaUsers className="me-2" />
              <span className="small">{event.participants} participants</span>
            </div>
          </div>
        </div>

        {/* Bouton Options */}
        <Button variant="link" className="text-muted p-0">
          <FaEllipsisV />
        </Button>
      </Card.Body>
    </Card>
  );
}

function Schedule() {
  return (
    <div className="bg-white rounded-3 shadow-lg p-4">
      {/* En-tête */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="h5 fw-bold text-dark">Programme d'Aujourd'hui</h2>
        <Button className="d-flex align-items-center rounded-pill px-3 py-2 shadow-sm" style={{ background: 'linear-gradient(135deg, #6B73FF, #000DFF)', border: 'none' }}>
          <FaPlus className="me-2" /> Ajouter un événement
        </Button>
      </div>
      
      {/* Liste des événements */}
      <div>
        {scheduleEvents.map((event) => (
          <ScheduleEvent key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
}

export default Schedule;
