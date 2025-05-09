import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Table,
  Button,
  Modal,
  Form,
  Container,
  Card,
} from 'react-bootstrap';
import { Plus, Pencil, Trash } from 'react-bootstrap-icons';
import './admin.css';

const GestionNiveau = () => {
  const [niveaux, setNiveaux] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedNiveau, setSelectedNiveau] = useState(null);
  const [formData, setFormData] = useState({ nom: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all niveaux
  useEffect(() => {
    const fetchNiveaux = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/niveaux');
        setNiveaux(response.data);
      } catch (err) {
        setError('Erreur lors du chargement des niveaux');
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchNiveaux();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission (Create/Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      nom: formData.nom,
      description: formData.description,
    };

    try {
      if (selectedNiveau) {
        // Update existing niveau
        const response = await axios.put(`http://localhost:5000/api/niveaux/${selectedNiveau.id}`, data);
        setNiveaux(niveaux.map((n) => (n.id === selectedNiveau.id ? response.data.niveau : n)));
      } else {
        // Create new niveau
        const response = await axios.post('http://localhost:5000/api/niveaux', data);
        setNiveaux([...niveaux, response.data.niveau]);
      }
      setShowModal(false);
      setFormData({ nom: '', description: '' });
      setSelectedNiveau(null);
    } catch (err) {
      setError('Erreur lors de la soumission');
      console.error('Submit error:', err.response ? err.response.data : err);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm('Voulez-vous vraiment supprimer ce niveau ?')) {
      try {
        await axios.delete(`http://localhost:5000/api/niveaux/${id}`);
        setNiveaux(niveaux.filter((n) => n.id !== id));
      } catch (err) {
        setError('Erreur lors de la suppression');
        console.error('Delete error:', err);
      }
    }
  };

  // Handle edit
  const handleEdit = (niveau) => {
    setSelectedNiveau(niveau);
    setFormData({ nom: niveau.nom, description: niveau.description });
    setShowModal(true);
  };

  if (loading) return <div className="text-center py-10">Chargement...</div>;
  if (error) return <div className="text-center py-10 text-danger">{error}</div>;

  return (
    <Container fluid className="gestion-niveau-container">
      <Card className="shadow-sm border-0">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="text-dark font-weight-bold">Gestion des Niveaux</h2>
            <Button
              variant="primary"
              className="btn-add-niveau"
              onClick={() => {
                setSelectedNiveau(null);
                setFormData({ nom: '', description: '' });
                setShowModal(true);
              }}
            >
              <Plus size={20} className="me-2" /> Ajouter un niveau
            </Button>
          </div>

          <Table responsive hover className="table-custom">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nom</th>
                <th>Description</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {niveaux.map((niveau) => (
                <tr key={niveau.id}>
                  <td>{niveau.id}</td>
                  <td>{niveau.nom}</td>
                  <td>{niveau.description || 'N/A'}</td>
                  <td className="text-center">
                    <Button
                      variant="outline-warning"
                      size="sm"
                      className="me-2 btn-action"
                      onClick={() => handleEdit(niveau)}
                    >
                      <Pencil size={16} /> Modifier
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      className="btn-action"
                      onClick={() => handleDelete(niveau.id)}
                    >
                      <Trash size={16} /> Supprimer
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>{selectedNiveau ? 'Modifier Niveau' : 'Ajouter Niveau'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Nom</Form.Label>
              <Form.Control
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                required
                placeholder="Entrez le nom du niveau"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Entrez une description (facultatif)"
              />
            </Form.Group>
            <Button
              variant="primary"
              type="submit"
              className="w-100 btn-submit"
            >
              {selectedNiveau ? 'Mettre à jour' : 'Créer'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default GestionNiveau;