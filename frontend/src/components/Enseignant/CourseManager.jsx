import React, { useState } from 'react';
import { Table, Button, Form, Modal } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

const CourseManager = () => {
  const [courses, setCourses] = useState([
    { id: 1, name: 'Mathematics', description: 'Algebra and Geometry' },
    { id: 2, name: 'Science', description: 'Physics and Chemistry' },
  ]);
  const [showModal, setShowModal] = useState(false);
  const [newCourse, setNewCourse] = useState({ name: '', description: '' });
  const [editCourse, setEditCourse] = useState(null);

  const handleAddCourse = () => {
    setCourses([...courses, { id: courses.length + 1, ...newCourse }]);
    setNewCourse({ name: '', description: '' });
    setShowModal(false);
  };

  const handleEditCourse = (course) => {
    setEditCourse(course);
    setNewCourse({ name: course.name, description: course.description });
    setShowModal(true);
  };

  const handleUpdateCourse = () => {
    setCourses(
      courses.map((course) =>
        course.id === editCourse.id ? { ...course, ...newCourse } : course
      )
    );
    setNewCourse({ name: '', description: '' });
    setEditCourse(null);
    setShowModal(false);
  };

  const handleDeleteCourse = (id) => {
    setCourses(courses.filter((course) => course.id !== id));
  };

  return (
    <div className="card p-3">
      <h5>Gestion des cours</h5>
      <Button variant="primary" onClick={() => setShowModal(true)}>
        <FaPlus /> Ajouter un cours
      </Button>
      <Table striped bordered hover className="mt-3">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nom</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course) => (
            <tr key={course.id}>
              <td>{course.id}</td>
              <td>{course.name}</td>
              <td>{course.description}</td>
              <td>
                <Button
                  variant="warning"
                  className="me-2"
                  onClick={() => handleEditCourse(course)}
                >
                  <FaEdit />
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleDeleteCourse(course.id)}
                >
                  <FaTrash />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal for Add/Edit Course */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editCourse ? 'Modifier le cours' : 'Ajouter un cours'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nom du cours</Form.Label>
              <Form.Control
                type="text"
                value={newCourse.name}
                onChange={(e) =>
                  setNewCourse({ ...newCourse, name: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={newCourse.description}
                onChange={(e) =>
                  setNewCourse({ ...newCourse, description: e.target.value })
                }
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Annuler
          </Button>
          <Button
            variant="primary"
            onClick={editCourse ? handleUpdateCourse : handleAddCourse}
          >
            {editCourse ? 'Modifier' : 'Ajouter'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CourseManager;