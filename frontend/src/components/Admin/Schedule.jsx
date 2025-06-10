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
              <p className="text-muted small mb-2">Cours: {event.Cour ? event.Cour.titre : 'N/A'}</p> {/* Correction : Cours -> Cour */}
              <p className="text-muted small mb-2">Classe: {event.Classe ? event.Classe.nom : 'N/A'}</p>
              <p className="text-muted small mb-2">Enseignant: {event.Cour && event.Cour.Creator ? event.Cour.Creator.nom : 'N/A'}</p> {/* Ajout du nom de l'enseignant */}
            </div>
            <span className={`badge rounded-pill px-3 py-1 ${event.statut === 'Planifié' ? 'bg-primary bg-opacity-10 text-primary' : event.statut === 'En cours' ? 'bg-warning bg-opacity-10 text-warning' : event.statut === 'Terminé' ? 'bg-success bg-opacity-10 text-success' : 'bg-danger bg-opacity-10 text-danger'}`}>
              {event.statut}
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
  const [classes, setClasses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    titre: '',
    date_debut: '',
    date_fin: '',
    cours_id: '',
    classe_id: '',
    statut: 'Planifié',
  });
  const [error, setError] = useState(null);

  // Fetch plannings, courses, and classes on mount
  useEffect(() => {
    fetchPlannings();
    fetchCourses();
    fetchClasses();
  }, []);

  const fetchPlannings = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/plannings', { withCredentials: true }, {
        params: { include: 'Cours,Classe' }, // Inclure Cours et Classe
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

  const fetchClasses = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/classes');
      setClasses(response.data);
    } catch (err) {
      console.error('Erreur lors de la récupération des classes:', err);
      setError('Impossible de charger les classes.');
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
        await axios.put(`http://localhost:5000/api/plannings/${formData.id}`, { withCredentials: true }, formData);
      } else {
        // Create new planning
        await axios.post('http://localhost:5000/api/plannings', { withCredentials: true }, formData);
      }
      fetchPlannings();
      handleClose();
    } catch (err) {
      console.error('Erreur lors de la sauvegarde du planning:', err);
      setError('Erreur lors de la sauvegarde du planning.');
    }
  };

  const handleEdit = (event) => {
    // Create a Date object from event.date_debut
    const startDate = new Date(event.date_debut);
    const endDate = new Date(event.date_fin);
  
    // Format dates for datetime-local input (YYYY-MM-DDTHH:mm)
    const formatDateForInput = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    };
  
    setFormData({
      id: event.id,
      titre: event.titre,
      date_debut: formatDateForInput(startDate),
      date_fin: formatDateForInput(endDate),
      cours_id: event.cours_id,
      classe_id: event.classe_id,
      statut: event.statut,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Voulez-vous vraiment supprimer ce planning ?')) {
      try {
        await axios.delete(`http://localhost:5000/api/plannings/${id}`, { withCredentials: true });
        fetchPlannings();
      } catch (err) {
        console.error('Erreur lors de la suppression du planning:', err);
        setError('Erreur lors de la suppression du planning.');
      }
    }
  };

  const handleClose = () => {
    setShowModal(false);
    setFormData({ id: null, titre: '', date_debut: '', date_fin: '', cours_id: '', classe_id: '', statut: 'Planifié' });
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
                className='w-50'
                name="titre"
                value={formData.titre}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Date de début</Form.Label>
              <Form.Control
               className='w-50'
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
                 className='w-50'
                value={formData.date_fin}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Nom du Cours</Form.Label>
              <Form.Select
               className='w-50'
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
            <Form.Group className="mb-3">
              <Form.Label>Classe</Form.Label>
              <Form.Select
               className='w-50'
                name="classe_id"
                value={formData.classe_id}
                onChange={handleInputChange}
                required
              >
                <option value="">Sélectionner une classe</option>
                {classes.map((classe) => (
                  <option key={classe.id} value={classe.id}>
                    {classe.nom}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Statut</Form.Label>
              <Form.Select
               className='w-50'
                name="statut"
                value={formData.statut}
                onChange={handleInputChange}
                required
              >
                <option value="Planifié">Planifié</option>
                <option value="En cours">En cours</option>
                <option value="Terminé">Terminé</option>
                <option value="Annulé">Annulé</option>
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