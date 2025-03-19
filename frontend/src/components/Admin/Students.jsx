import React from 'react';
import { FaPlus, FaEllipsisV } from 'react-icons/fa';
import { Button, Table, ProgressBar } from 'react-bootstrap';

const students = [
  {
    id: '1',
    name: 'Emma Wilson',
    email: 'emma.w@example.com',
    enrolledCourses: 3,
    progress: 78,
    lastActive: 'Il y a 2 heures',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
  {
    id: '2',
    name: 'James Rodriguez',
    email: 'james.r@example.com',
    enrolledCourses: 4,
    progress: 92,
    lastActive: 'Il y a 1 jour',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
  {
    id: '3',
    name: 'Sarah Chen',
    email: 'sarah.c@example.com',
    enrolledCourses: 2,
    progress: 45,
    lastActive: 'Il y a 3 heures',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
];

function Students() {
  return (
    <div className="bg-white rounded-3 shadow-sm p-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold text-dark">Étudiants</h4>
        <Button className="btn btn-primary rounded-pill d-flex align-items-center">
          <FaPlus className="me-2" /> Ajouter un étudiant
        </Button>
      </div>
      <Table hover responsive className="align-middle">
        <thead className="bg-light">
          <tr>
            <th>ÉTUDIANT</th>
            <th>Email</th>
            <th>COURS</th>
            <th>PROGRÈS</th>
            <th>DERNIÈRE ACTIVITÉ</th>
            <th className="text-end">ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.id}>
              <td>
                <div className="d-flex align-items-center">
                  <img
                    src={student.image}
                    alt={student.name}
                    className="rounded-circle me-3"
                    width="40"
                    height="40"
                  />
                  <span className="fw-semibold text-dark">{student.name}</span>
                </div>
              </td>
              <td className="text-muted">{student.email}</td>
              <td>{student.enrolledCourses}</td>
              <td>
                <ProgressBar
                  now={student.progress}
                  variant="primary"
                  className="rounded-pill bg-light"
                  style={{ height: '6px' }}
                />
                <span className="ms-2 text-muted">{student.progress}%</span>
              </td>
              <td className="text-muted">{student.lastActive}</td>
              <td className="text-end">
                <Button variant="link" className="text-muted">
                  <FaEllipsisV />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

export default Students;
