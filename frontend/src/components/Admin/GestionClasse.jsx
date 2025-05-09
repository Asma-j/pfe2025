
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Table,
  Button,
  Modal,
  Form,
  Container,
  Card,
  FormControl,
} from 'react-bootstrap';
import { Plus, Pencil, Trash } from 'react-bootstrap-icons';
import './admin.css';

const GestionClasse = () => {
  const [classes, setClasses] = useState([]);
  const [niveaux, setNiveaux] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedClasse, setSelectedClasse] = useState(null);
  const [formData, setFormData] = useState({ nom: '', niveau_id: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all classes and niveaux
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [classesResponse, niveauxResponse] = await Promise.all([
          axios.get('http://localhost:5000/api/classes'),
          axios.get('http://localhost:5000/api/niveaux'),
        ]);
        console.log('Classes response:', classesResponse.data); // Debug log
        console.log('Niveaux response:', niveauxResponse.data); // Debug log
        setClasses(classesResponse.data);
        setNiveaux(niveauxResponse.data);
      } catch (err) {
        setError('Erreur lors du chargement des données');
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
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
      niveau_id: parseInt(formData.niveau_id),
    };

    try {
      if (selectedClasse) {
        // Update existing classe
        const response = await axios.put(`http://localhost:5000/api/classes/${selectedClasse.id}`, data);
        setClasses(classes.map((c) => (c.id === selectedClasse.id ? response.data.classe : c)));
      } else {
        // Create new classe
        const response = await axios.post('http://localhost:5000/api/classes', data);
        setClasses([...classes, response.data.classe]);
      }
      setShowModal(false);
      setFormData({ nom: '', niveau_id: '' });
      setSelectedClasse(null);
    } catch (err) {
      setError('Erreur lors de la soumission');
      console.error('Submit error:', err.response ? err.response.data : err);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm('Voulez-vous vraiment supprimer cette classe ?')) {
      try {
        await axios.delete(`http://localhost:5000/api/classes/${id}`);
        setClasses(classes.filter((c) => c.id !== id));
      } catch (err) {
        setError('Erreur lors de la suppression');
        console.error('Delete error:', err);
      }
    }
  };

  // Handle edit
  const handleEdit = (classe) => {
    setSelectedClasse(classe);
    setFormData({ nom: classe.nom, niveau_id: classe.niveau_id });
    setShowModal(true);
  };

  if (loading) return <div className="text-center py-10">Chargement...</div>;
  if (error) return <div className="text-center py-10 text-danger">{error}</div>;

  return (
    <Container fluid className="gestion-classe-container">
      <Card className="shadow-sm border-0">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="text-dark font-weight-bold">Gestion des Classes</h2>
            <Button
              variant="primary"
              className="btn-add-classe"
              onClick={() => {
                setSelectedClasse(null);
                setFormData({ nom: '', niveau_id: '' });
                setShowModal(true);
              }}
            >
              <Plus size={20} className="me-2" /> Ajouter une classe
            </Button>
          </div>

          <Table responsive hover className="table-custom">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nom</th>
                <th>Niveau</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {classes.map((classe) => (
                <tr key={classe.id}>
                  <td>{classe.id}</td>
                  <td>{classe.nom}</td>
                  <td>{classe.Niveau ? classe.Niveau.nom : 'N/A'}</td>
                  <td className="text-center">
                    <Button
                      variant="outline-warning"
                      size="sm"
                      className="me-2 btn-action"
                      onClick={() => handleEdit(classe)}
                    >
                      <Pencil size={16} /> Modifier
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      className="btn-action"
                      onClick={() => handleDelete(classe.id)}
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
          <Modal.Title>{selectedClasse ? 'Modifier Classe' : 'Ajouter Classe'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Nom</Form.Label>
              <FormControl
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                required
                placeholder="Entrez le nom de la classe"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Niveau</Form.Label>
              <FormControl
                as="select"
                name="niveau_id"
                value={formData.niveau_id}
                onChange={handleChange}
                required
              >
                <option value="">Sélectionnez un niveau</option>
                {niveaux.map((niveau) => (
                  <option key={niveau.id} value={niveau.id}>
                    {niveau.nom}
                  </option>
                ))}
              </FormControl>
            </Form.Group>
            <Button
              variant="primary"
              type="submit"
              className="w-100 btn-submit"
            >
              {selectedClasse ? 'Mettre à jour' : 'Créer'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default GestionClasse;
