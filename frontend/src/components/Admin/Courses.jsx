import React from 'react';
import { FaUsers, FaClock } from 'react-icons/fa';
import { Button, Card, ProgressBar } from 'react-bootstrap';

const courses = [
  {
    id: '1',
    title: 'Advanced JavaScript Development',
    instructor: 'Dr. Alan Smith',
    students: 156,
    progress: 65,
    duration: '12 weeks',
    image: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=300&q=80',
  },
  {
    id: '2',
    title: 'UX/UI Design Fundamentals',
    instructor: 'Maria Garcia',
    students: 89,
    progress: 78,
    duration: '8 weeks',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=300&q=80',
  },
  {
    id: '3',
    title: 'Data Science Essentials',
    instructor: 'Prof. John Davis',
    students: 234,
    progress: 92,
    duration: '16 weeks',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=300&q=80',
  },
];

function CourseCard({ course }) {
  return (
    <Card className="shadow-sm border-0 rounded-3">
      <Card.Img variant="top" src={course.image} alt={course.title} />
      <Card.Body>
        <Card.Title>{course.title}</Card.Title>
        <Card.Subtitle className="mb-2 text-muted">{course.instructor}</Card.Subtitle>
        <div className="d-flex justify-content-between">
          <div className="d-flex align-items-center">
            <FaUsers className="text-primary me-2" />
            <span>{course.students} students</span>
          </div>
          <div className="d-flex align-items-center">
            <FaClock className="text-primary me-2" />
            <span>{course.duration}</span>
          </div>
        </div>
        <div className="mt-3">
          <div className="d-flex justify-content-between">
            <span>Course Progress</span>
            <span>{course.progress}%</span>
          </div>
          <ProgressBar now={course.progress} variant="info" />
        </div>
        <div className="mt-4 d-flex justify-content-end gap-2">
          <Button variant="outline-primary">View Details</Button>
          <Button variant="primary">Edit Course</Button>
        </div>
      </Card.Body>
    </Card>
  );
}

function Courses() {
  return (
    <div className="space-y-6">
      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
        {courses.map((course) => (
          <div className="col" key={course.id}>
            <CourseCard course={course} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default Courses;
