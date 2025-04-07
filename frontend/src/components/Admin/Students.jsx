import React, { useEffect, useState } from 'react';
import { FaPlus, FaEllipsisV, FaTrash, FaEdit } from 'react-icons/fa';
import { Button, Table, ProgressBar, Modal, Form } from 'react-bootstrap';
import axios from 'axios';

function Students() {
  const [students, setStudents] = useState([]); // State to store users
  const [loading, setLoading] = useState(true); // State to manage loading
  const [showModal, setShowModal] = useState(false); // State to manage modal visibility
  const [selectedStudent, setSelectedStudent] = useState(null); // State to store selected student
  const [status, setStatus] = useState(''); // State for the status input

  useEffect(() => {
    // Fetch approved users from the API
    axios
      .get("http://localhost:5000/api/users/approved")
      .then((response) => {
        setStudents(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
        setLoading(false);
      });
  }, []);

  // Handle Update
  const handleUpdate = (id) => {
    axios
      .put(`http://localhost:5000/api/users/${id}`, { status })
      .then((response) => {
        console.log("User updated:", response.data);
        // Refresh the student list after update
        setStudents((prevStudents) =>
          prevStudents.map((student) =>
            student.id === id ? { ...student, status } : student
          )
        );
        setShowModal(false); // Close the modal
      })
      .catch((error) => {
        console.error("Error updating user:", error);
      });
  };

  // Handle Delete
  const handleDelete = (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet étudiant?")) {
      axios
        .delete(`http://localhost:5000/api/users/${id}`)
        .then((response) => {
          console.log("User deleted:", response.data);
          setStudents((prevStudents) =>
            prevStudents.filter((student) => student.id !== id)
          );
        })
        .catch((error) => {
          console.error("Error deleting user:", error);
        });
    }
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

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
            <th>STATUT</th>
            <th className="text-end">ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {students.length > 0 ? (
            students.map((student) => (
              <tr key={student.id}>
                <td>
                  <div className="d-flex align-items-center">
                    <img
                      src={student.photo || 'https://via.placeholder.com/150'}
                      alt={student.prenom}
                      className="rounded-circle me-3"
                      width="40"
                      height="40"
                    />
                    <span className="fw-semibold text-dark">{student.prenom} {student.nom}</span>
                  </div>
                </td>
                <td className="text-muted">{student.email}</td>
                <td>{student.courses ? student.courses.length : 0}</td>
                <td>
                  <ProgressBar
                    now={student.progress || 0}
                    variant="primary"
                    className="rounded-pill bg-light"
                    style={{ height: '6px' }}
                  />
                  <span className="ms-2 text-muted">{student.progress || 0}%</span>
                </td>
                <td className="text-muted">{student.status}</td>
                <td className="text-end">
                  <Button
                    variant="link"
                    className="text-muted"
                    onClick={() => {
                      setSelectedStudent(student);
                      setStatus(student.status); // Set the current status
                      setShowModal(true); // Open the modal
                    }}
                  >
                    <FaEdit />
                  </Button>
                  <Button
                    variant="link"
                    className="text-muted"
                    onClick={() => handleDelete(student.id)}
                  >
                    <FaTrash />
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center">Aucun étudiant approuvé</td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Modal for updating student status */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Mettre à jour le statut de l'étudiant</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formStatus">
              <Form.Label>Statut</Form.Label>
              <Form.Control
                as="select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="approved">Approuvé</option>
                <option value="pending">En attente</option>
                <option value="rejected">Rejeté</option>
              </Form.Control>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Fermer
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              if (selectedStudent) {
                handleUpdate(selectedStudent.id);
              }
            }}
          >
            Sauvegarder
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Students;
