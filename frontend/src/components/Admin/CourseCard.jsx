import React, { useEffect, useState } from 'react';
import { FaUsers } from 'react-icons/fa';
import { Button, Card } from 'react-bootstrap';
import axios from 'axios';

function CourseCard({ course, onShowDetails, onShowEdit }) {
  const [studentCount, setStudentCount] = useState(course.students || 0);
  const [loading, setLoading] = useState(true);



  return (
    <Card className="course-card shadow-sm border-0 rounded-4 overflow-hidden">
      <Card.Img
        variant="top"
        src={`http://localhost:5000/uploads/${course.image}`}
        alt={course.titre}
        className="course-card-img"
        onError={(e) => (e.target.src = 'https://via.placeholder.com/300')}
      />
      <Card.Body className="p-4">
        <Card.Title className="mb-1 fw-bold fs-4">{course.titre}</Card.Title>
        <Card.Subtitle className="mb-3 mt-3 text-muted"> Enseignant:
          {course.Creator ? `${course.Creator.prenom} ${course.Creator.nom}` : 'Instructeur inconnu'}
        </Card.Subtitle>



        <div className="d-flex justify-content-end gap-2">
          <Button variant="outline-info" size="sm" onClick={() => onShowDetails(course)}>
            Voir les détails
          </Button>
          <Button variant="info" size="sm" onClick={() => onShowEdit(course)}>
            Modifier
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}

export default CourseCard;