import React, { useState } from 'react';
import { Form, Table } from 'react-bootstrap';

const StudentList = () => {
  const [selectedClass, setSelectedClass] = useState('Class A');

  const students = {
    'Class A': [
      { id: 1, name: 'John Doe', grade: 95 },
      { id: 2, name: 'Jane Smith', grade: 88 },
    ],
    'Class B': [
      { id: 3, name: 'Alex Brown', grade: 82 },
      { id: 4, name: 'Emily Davis', grade: 78 },
    ],
  };

  return (
    <div className="card p-3">
      <h5>Liste des étudiants</h5>
      <Form.Group className="mb-3">
        <Form.Label>Sélectionner une classe</Form.Label>
        <Form.Select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
        >
          <option>Class A</option>
          <option>Class B</option>
        </Form.Select>
      </Form.Group>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nom</th>
            <th>Note</th>
          </tr>
        </thead>
        <tbody>
          {students[selectedClass].map((student) => (
            <tr key={student.id}>
              <td>{student.id}</td>
              <td>{student.name}</td>
              <td>{student.grade}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default StudentList;