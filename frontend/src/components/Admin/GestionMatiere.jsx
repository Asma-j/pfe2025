import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Table,
  Button,
  Modal,
  Form,
  InputGroup,
  Image,
  Container,
  Card,
} from 'react-bootstrap';
import { Plus, Pencil, Trash, Upload } from 'react-bootstrap-icons';
import './admin.css'; // Import custom CSS

const GestionMatiere = () => {
  const [matieres, setMatieres] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedMatiere, setSelectedMatiere] = useState(null);
  const [formData, setFormData] = useState({ nom: '', description: '', image: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all matieres
  useEffect(() => {
    const fetchMatieres = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/matieres');
        setMatieres(response.data);
      } catch (err) {
        setError('Erreur lors du chargement des matières');
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMatieres();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
    if (files) {
      console.log('Selected file:', files[0]);
    }
  };

  // Handle form submission (Create/Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('nom', formData.nom);
    data.append('description', formData.description);
    if (formData.image) {
      data.append('image', formData.image);
      console.log('FormData image:', formData.image);
    }

    try {
      if (selectedMatiere) {
        const response = await axios.put(`http://localhost:5000/api/matieres/${selectedMatiere.id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        console.log('Update response:', response.data);
        setMatieres(matieres.map((m) => (m.id === selectedMatiere.id ? response.data.matiere : m)));
      } else {
        const response = await axios.post('http://localhost:5000/api/matieres', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        console.log('Create response:', response.data);
        setMatieres([...matieres, response.data.matiere]);
      }
      setShowModal(false);
      setFormData({ nom: '', description: '', image: null });
      setSelectedMatiere(null);
    } catch (err) {
      setError('Erreur lors de la soumission');
      console.error('Submit error:', err.response ? err.response.data : err);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm('Voulez-vous vraiment supprimer cette matière ?')) {
      try {
        await axios.delete(`http://localhost:5000/api/matieres/${id}`);
        setMatieres(matieres.filter((m) => m.id !== id));
      } catch (err) {
        setError('Erreur lors de la suppression');
        console.error('Delete error:', err);
      }
    }
  };

  // Handle edit
  const handleEdit = (matiere) => {
    setSelectedMatiere(matiere);
    setFormData({ nom: matiere.nom, description: matiere.description, image: null });
    setShowModal(true);
  };

  // Handle image load error
  const handleImageError = (e) => {
    e.target.src = 'https://via.placeholder.com/50?text=Image+Not+Found';
  };

  if (loading) return <div className="text-center py-10">Chargement...</div>;
  if (error) return <div className="text-center py-10 text-danger">{error}</div>;

  return (
    <Container fluid className="gestion-matiere-container">
      <Card className="shadow-sm border-0">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="text-dark font-weight-bold">Gestion des Matières</h2>
            <Button
              variant="primary"
              className="btn-add-matiere"
              onClick={() => {
                setSelectedMatiere(null);
                setFormData({ nom: '', description: '', image: null });
                setShowModal(true);
              }}
            >
              <Plus size={20} className="me-2" /> Ajouter une matière
            </Button>
          </div>

          <Table responsive hover className="table-custom">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nom</th>
                <th>Description</th>
                <th>Image</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {matieres.map((matiere) => (
                <tr key={matiere.id}>
                  <td>{matiere.id}</td>
                  <td>{matiere.nom}</td>
                  <td>{matiere.description || 'N/A'}</td>
                  <td>
                    {matiere.image ? (
                      <Image
                        src={`http://localhost:5000/uploads/${matiere.image}`}
                        alt={matiere.nom}
                        width={40}
                        height={40}
                        rounded
                        onError={handleImageError}
                      />
                    ) : (
                      'N/A'
                    )}
                  </td>
                  <td className="text-center">
                    <Button
                      variant="outline-warning"
                      size="sm"
                      className="me-2 btn-action"
                      onClick={() => handleEdit(matiere)}
                    >
                      <Pencil size={16} /> Modifier
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      className="btn-action"
                      onClick={() => handleDelete(matiere.id)}
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
          <Modal.Title>{selectedMatiere ? 'Modifier Matière' : 'Ajouter Matière'}</Modal.Title>
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
                placeholder="Entrez le nom de la matière"
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
            <Form.Group className="mb-3">
              <Form.Label>Image</Form.Label>
              <InputGroup>
                <Form.Control
                  type="file"
                  name="image"
                  onChange={handleChange}
                  accept="image/*"
                />
                <InputGroup.Text>
                  <Upload size={16} />
                </InputGroup.Text>
              </InputGroup>
            </Form.Group>
            <Button
              variant="primary"
              type="submit"
              className="w-100 btn-submit"
            >
              {selectedMatiere ? 'Mettre à jour' : 'Créer'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default GestionMatiere;