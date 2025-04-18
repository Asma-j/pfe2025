import React, { useEffect, useState } from 'react';
import { FaPlus, FaTrash, FaEdit } from 'react-icons/fa';
import { Button, Table, Modal, Form, OverlayTrigger, Tooltip } from 'react-bootstrap';
import axios from 'axios';
import profil from "../images/businessman-310819_1280.png";
import './user.css'; // Reuse the same CSS as Students for consistency

function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [status, setStatus] = useState('');
  const [newTeacher, setNewTeacher] = useState({
    prenom: '',
    nom: '',
    email: '',
    mot_de_passe: '',
    id_role: 1003, // Role ID for teachers
  });

  // Fetch teachers on component mount
  useEffect(() => {
    axios
      .get('http://localhost:5000/api/users/teachers')
      .then((response) => {
        setTeachers(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching teachers:', error);
        setLoading(false);
      });
  }, []);

  const handleAddTeacher = () => {
    axios
      .post('http://localhost:5000/api/users/addUser', newTeacher)
      .then((response) => {
        setTeachers([...teachers, response.data.data]);
        setShowAddTeacherModal(false);
        setNewTeacher({ prenom: '', nom: '', email: '', mot_de_passe: '', id_role: 1003 });
      })
      .catch((error) => {
        console.error('Error adding teacher:', error);
      });
  };

  const handleUpdate = (id) => {
    axios
      .put(`http://localhost:5000/api/users/${id}`, { status })
      .then((response) => {
        setTeachers((prev) =>
          prev.map((teacher) =>
            teacher.id === id ? { ...teacher, status } : teacher
          )
        );
        setShowUpdateModal(false);
      })
      .catch((error) => {
        console.error('Error updating teacher:', error);
      });
  };

  const handleDelete = (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet enseignant?')) {
      axios
        .delete(`http://localhost:5000/api/users/${id}`)
        .then((response) => {
          setTeachers((prev) => prev.filter((teacher) => teacher.id !== id));
        })
        .catch((error) => {
          console.error('Error deleting teacher:', error);
        });
    }
  };

  const renderTable = () => (
    <div className="mb-5">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="section-title">Enseignants</h4>
        <Button
          className="custom-btn"
          variant="primary"
          onClick={() => setShowAddTeacherModal(true)}
        >
          <FaPlus className="me-2" /> Ajouter un nouvel enseignant
        </Button>
      </div>
      <Table className="custom-table">
        <thead>
          <tr>
            <th>ENSEIGNANT</th>
            <th>Email</th>
            <th>STATUT</th>
            <th className="text-end">ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {teachers.length > 0 ? (
            teachers.map((teacher) => (
              <tr key={teacher.id}>
                <td>
                  <div className="d-flex align-items-center">
                    <img
                      src={teacher.photo || profil}
                      alt={teacher.prenom}
                      className="student-avatar rounded-circle me-3"
                    />
                    <span className="fw-semibold text-dark">{teacher.prenom} {teacher.nom}</span>
                  </div>
                </td>
                <td className="text-muted">{teacher.email}</td>
                <td className="text-muted">{teacher.status || 'pending'}</td>
                <td className="text-end">
                  <OverlayTrigger
                    placement="top"
                    overlay={<Tooltip>Modifier le statut</Tooltip>}
                  >
                    <Button
                      variant="link"
                      className="text-muted action-btn"
                      onClick={() => {
                        setSelectedTeacher(teacher);
                        setStatus(teacher.status || 'pending');
                        setShowUpdateModal(true);
                      }}
                    >
                      <FaEdit />
                    </Button>
                  </OverlayTrigger>
                  <OverlayTrigger
                    placement="top"
                    overlay={<Tooltip>Supprimer l'enseignant</Tooltip>}
                  >
                    <Button
                      variant="link"
                      className="text-muted action-btn"
                      onClick={() => handleDelete(teacher.id)}
                    >
                      <FaTrash />
                    </Button>
                  </OverlayTrigger>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center text-muted">
                Aucun enseignant
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );

  if (loading) {
    return (
      <div className="text-center my-5">
        <h5 className="text-muted">Chargement...</h5>
      </div>
    );
  }

  return (
    <div className="students-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="section-title">Gestion des Enseignants</h4>
      </div>

      {renderTable()}

      {/* Modal pour ajouter un enseignant */}
      <Modal show={showAddTeacherModal} onHide={() => setShowAddTeacherModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Ajouter un nouvel enseignant</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formTeacherPrenom" className="mb-3">
              <Form.Label className="form-label">Prénom</Form.Label>
              <Form.Control
                type="text"
                value={newTeacher.prenom}
                onChange={(e) => setNewTeacher({ ...newTeacher, prenom: e.target.value })}
                placeholder="Entrez le prénom"
                className="form-control w-50"
              />
            </Form.Group>
            <Form.Group controlId="formTeacherNom" className="mb-3">
              <Form.Label className="form-label">Nom</Form.Label>
              <Form.Control
                type="text"
                value={newTeacher.nom}
                onChange={(e) => setNewTeacher({ ...newTeacher, nom: e.target.value })}
                placeholder="Entrez le nom"
                className="form-control w-50"
              />
            </Form.Group>
            <Form.Group controlId="formTeacherEmail" className="mb-3">
              <Form.Label className="form-label">Email</Form.Label>
              <Form.Control
                type="email"
                value={newTeacher.email}
                onChange={(e) => setNewTeacher({ ...newTeacher, email: e.target.value })}
                placeholder="Entrez l'email"
                className="form-control w-50"
              />
            </Form.Group>
            <Form.Group controlId="formTeacherPassword" className="mb-3">
              <Form.Label className="form-label">Mot de passe</Form.Label>
              <Form.Control
                type="password"
                value={newTeacher.mot_de_passe}
                onChange={(e) => setNewTeacher({ ...newTeacher, mot_de_passe: e.target.value })}
                placeholder="Entrez le mot de passe"
                className="form-control w-50"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddTeacherModal(false)}>
            Fermer
          </Button>
          <Button
            variant="primary"
            onClick={handleAddTeacher}
            disabled={!newTeacher.prenom || !newTeacher.nom || !newTeacher.email || !newTeacher.mot_de_passe}
            className="custom-btn"
          >
            Ajouter
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal pour mise à jour du statut */}
      <Modal show={showUpdateModal} onHide={() => setShowUpdateModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Mettre à jour le statut</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formStatus" className="mb-3">
              <Form.Label className="form-label">Statut</Form.Label>
              <Form.Control
                as="select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="form-control w-50"
              >
                <option value="approved">Approuvé</option>
                <option value="pending">En attente</option>
                <option value="rejected">Rejeté</option>
              </Form.Control>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUpdateModal(false)}>
            Fermer
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              if (selectedTeacher) {
                handleUpdate(selectedTeacher.id);
              }
            }}
            className="custom-btn"
          >
            Sauvegarder
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Teachers;