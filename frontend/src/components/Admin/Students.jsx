import React from 'react';
import { FaPlus, FaEllipsisV } from 'react-icons/fa';
import { Button, Table } from 'react-bootstrap';

const students = [
  {
    id: '1',
    name: 'Emma Wilson',
    email: 'emma.w@example.com',
    enrolledCourses: 3,
    progress: 78,
    lastActive: '2 hours ago',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
  {
    id: '2',
    name: 'James Rodriguez',
    email: 'james.r@example.com',
    enrolledCourses: 4,
    progress: 92,
    lastActive: '1 day ago',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
  {
    id: '3',
    name: 'Sarah Chen',
    email: 'sarah.c@example.com',
    enrolledCourses: 2,
    progress: 45,
    lastActive: '3 hours ago',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
];

function Students() {
  return (
    <div className="bg-white rounded-2xl shadow-soft border border-gray-100 animate-fade-in">
      <div className="p-6 border-b border-gray-100">
        <div className="d-flex justify-content-between align-items-center">
          <h2 className="text-xl font-semibold text-gray-900">Students</h2>
          <Button variant="gradient-primary" className="d-flex align-items-center">
            <FaPlus className="me-2" /> Add Student
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <Table responsive hover>
          <thead>
            <tr>
              <th>Student</th>
              <th>Email</th>
              <th>Courses</th>
              <th>Progress</th>
              <th>Last Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id}>
                <td>
                  <div className="d-flex align-items-center gap-4">
                    <img
                      src={student.image}
                      alt={student.name}
                      className="h-10 w-10 rounded-circle ring-2 ring-white shadow-sm"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{student.name}</p>
                    </div>
                  </div>
                </td>
                <td>{student.email}</td>
                <td>{student.enrolledCourses}</td>
                <td>
                  <div className="d-flex align-items-center gap-3">
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="progress-bar"
                        style={{ width: `${student.progress}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {student.progress}%
                    </span>
                  </div>
                </td>
                <td>{student.lastActive}</td>
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
    </div>
  );
}

export default Students;
