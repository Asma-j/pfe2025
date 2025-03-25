import React from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

const TeacherCalendar = () => {
  const events = [
    {
      title: 'Math Class',
      start: new Date(2025, 2, 22, 10, 0),
      end: new Date(2025, 2, 22, 11, 0),
    },
    {
      title: 'Science Class',
      start: new Date(2025, 2, 22, 13, 0),
      end: new Date(2025, 2, 22, 14, 0),
    },
  ];

  return (
    <div className="card p-3">
      <h5>Emploi du temps</h5>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 300 }}
      />
    </div>
  );
};

export default TeacherCalendar;