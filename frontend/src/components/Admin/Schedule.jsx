import React from 'react';
import { FaUsers, FaClock, FaEllipsisV, FaPlus } from 'react-icons/fa';
import { Button, Card } from 'react-bootstrap';

const scheduleEvents = [
  {
    id: '1',
    title: 'JavaScript Advanced Concepts',
    type: 'lecture',
    time: '09:00 AM',
    duration: '2 hours',
    instructor: 'Dr. Alan Smith',
    participants: 45,
  },
  {
    id: '2',
    title: 'UX Research Workshop',
    type: 'workshop',
    time: '11:30 AM',
    duration: '1.5 hours',
    instructor: 'Maria Garcia',
    participants: 25,
  },
  {
    id: '3',
    title: 'Python Programming Mid-term',
    type: 'exam',
    time: '02:00 PM',
    duration: '3 hours',
    instructor: 'Prof. John Davis',
    participants: 120,
  },
];

function ScheduleEvent({ event }) {
  return (
    <Card className="mb-4 shadow-sm border-0 rounded-3">
      <Card.Body>
        <div className="d-flex align-items-start">
          <div className="text-center me-4">
            <p className="h3 text-primary">{event.time.split(' ')[0]}</p>
            <p className="text-muted">{event.time.split(' ')[1]}</p>
          </div>
          <div className="flex-grow-1">
            <div className="d-flex justify-content-between">
              <div>
                <h5 className="text-dark">{event.title}</h5>
                <p className="text-muted">{event.instructor}</p>
              </div>
              <span
                className={`badge ${
                  event.type === 'lecture'
                    ? 'bg-primary'
                    : event.type === 'workshop'
                    ? 'bg-success'
                    : 'bg-danger'
                }`}
              >
                {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
              </span>
            </div>
            <div className="mt-3 d-flex">
              <div className="d-flex align-items-center me-4">
                <FaClock className="text-info me-2" />
                <span>{event.duration}</span>
              </div>
              <div className="d-flex align-items-center">
                <FaUsers className="text-info me-2" />
                <span>{event.participants} participants</span>
              </div>
            </div>
          </div>
          <Button variant="link" className="text-muted ms-3">
            <FaEllipsisV />
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}

function Schedule() {
  return (
    <div className="bg-white rounded-3 shadow-lg p-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="h4 text-dark">Today's Schedule</h2>
        <Button variant="gradient-primary" className="d-flex align-items-center">
          <FaPlus className="me-2" /> Add Event
        </Button>
      </div>
      <div>
        {scheduleEvents.map((event) => (
          <ScheduleEvent key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
}

export default Schedule;
