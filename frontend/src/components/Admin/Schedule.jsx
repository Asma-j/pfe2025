import React, { useState, useEffect } from 'react';
import { FaUsers, FaClock, FaEllipsisV, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { Button, Card, Modal, Form, Dropdown } from 'react-bootstrap';
import axios from 'axios';

function ScheduleEvent({ event, onEdit, onDelete }) {
  return (
    <Card className="mb-3 border-0 shadow-sm rounded-3 p-3">
      <Card.Body className="d-flex align-items-center">
        {/* Heure */}
        <div className="text-center me-4">
          <p className="fw-bold text-primary display-6 mb-0">
            {new Date(event.date_debut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        {/* Détails de l'événement */}
        <div className="flex-grow-1">
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <h6 className="fw-bold mb-1">{event.titre}</h6>
              <p className="text-muted small mb-2">Cours: {event.Cours ? event.Cours.titre : 'N/A'}</p>
            </div>
            <span className="badge rounded-pill px-3 py-1 bg-primary bg-opacity-10 text-primary">
              Planning
            </span>
          </div>
          <div className="mt-2 d-flex">
            <div className="d-flex align-items-center me-4 text-muted">
              <FaClock className="me-2" />
              <span className="small">
                {new Date(event.date_debut).toLocaleDateString()} -{' '}
                {new Date(event.date_fin).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Menu d'options */}
        <Dropdown>
          <Dropdown.Toggle variant="link" className="text-muted p-0" id={`dropdown-${event.id}`}>
            <FaEllipsisV />
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item onClick={() => onEdit(event)}>
              <FaEdit className="me-2" /> Modifier
            </Dropdown.Item>
            <Dropdown.Item onClick={() => onDelete(event.id)}>
              <FaTrash className="me-2" /> Supprimer
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </Card.Body>
    </Card>
  );
}

function Schedule() {
  const [plannings, setPlannings] = useState([]);
  const [courses, setCourses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    titre: '',
    date_debut: '',
    date_fin: '',
    cours_id: '',
  });
  const [error, setError] = useState(null);

  // Fetch plannings and courses on mount
  useEffect(() => {
    fetchPlannings();
    fetchCourses();
  }, []);

  const fetchPlannings = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/plannings', {
        params: { include: 'Cours' }, // Ensure Cours data is included if needed
      });
      setPlannings(response.data);
    } catch (err) {
      console.error('Erreur lors de la récupération des plannings:', err);
      setError('Impossible de charger les plannings.');
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/cours');
      setCourses(response.data);
    } catch (err) {
      console.error('Erreur lors de la récupération des cours:', err);
      setError('Impossible de charger les cours.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.id) {
        // Update existing planning
        await axios.put(`http://localhost:5000/api/plannings/${formData.id}`, formData);
      } else {
        // Create new planning
        await axios.post('http://localhost:5000/api/plannings', formData);
      }
      fetchPlannings();
      handleClose();
    } catch (err) {
      console.error('Erreur lors de la sauvegarde du planning:', err);
      setError('Erreur lors de la sauvegarde du planning.');
    }
  };

  const handleEdit = (event) => {
    setFormData({
      id: event.id,
      titre: event.titre,
      date_debut: new Date(event.date_debut).toISOString().slice(0, 16),
      date_fin: new Date(event.date_fin).toISOString().slice(0, 16),
      cours_id: event.cours_id,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Voulez-vous vraiment supprimer ce planning ?')) {
      try {
        await axios.delete(`http://localhost:5000/api/plannings/${id}`);
        fetchPlannings();
      } catch (err) {
        console.error('Erreur lors de la suppression du planning:', err);
        setError('Erreur lors de la suppression du planning.');
      }
    }
  };

  const handleClose = () => {
    setShowModal(false);
    setFormData({ id: null, titre: '', date_debut: '', date_fin: '', cours_id: '' });
    setError(null);
  };

  return (
    <div className="bg-white rounded-3 shadow-lg p-4">
      {/* En-tête */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="h5 fw-bold text-dark">Programme</h2>
        <Button
          className="d-flex align-items-center rounded-pill px-3 py-2 shadow-sm"
          style={{ background: 'linear-gradient(135deg, #6B73FF, #000DFF)', border: 'none' }}
          onClick={() => setShowModal(true)}
        >
          <FaPlus className="me-2" /> Ajouter un événement
        </Button>
      </div>

      {/* Erreur */}
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Liste des événements */}
      <div>
        {plannings.length === 0 ? (
          <p className="text-muted">Aucun planning disponible.</p>
        ) : (
          plannings.map((event) => (
            <ScheduleEvent
              key={event.id}
              event={event}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {/* Modal pour ajouter/modifier */}
      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{formData.id ? 'Modifier le Planning' : 'Ajouter un Planning'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Titre</Form.Label>
              <Form.Control
                type="text"
                name="titre"
                value={formData.titre}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Date de début</Form.Label>
              <Form.Control
                type="datetime-local"
                name="date_debut"
                value={formData.date_debut}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Date de fin</Form.Label>
              <Form.Control
                type="datetime-local"
                name="date_fin"
                value={formData.date_fin}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Nom du Cours</Form.Label>
              <Form.Select
                name="cours_id"
                value={formData.cours_id}
                onChange={handleInputChange}
                required
              >
                <option value="">Sélectionner un cours</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.titre}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Button variant="primary" type="submit">
              {formData.id ? 'Mettre à jour' : 'Ajouter'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default Schedule;