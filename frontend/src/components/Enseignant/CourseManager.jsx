import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Modal } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import axios from 'axios';

const CourseManager = () => {
  const [courses, setCourses] = useState([]);
  const [matieres, setMatieres] = useState([]);
  const [selectedMatiereId, setSelectedMatiereId] = useState('');
  const [selectedMatiereName, setSelectedMatiereName] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newCourse, setNewCourse] = useState({
    titre: '',
    description: '',
    prix: '',
    module: '',
    status: 'Gratuit',
    matiere_id: '',
    image: null,
  });
  const [editCourse, setEditCourse] = useState(null);
  const [error, setError] = useState(null);

  // Set axios default headers
  const token = localStorage.getItem('token');
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  // Fetch matières
  useEffect(() => {
    const fetchMatieres = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/matieres');
        setMatieres(response.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      }
    };
    fetchMatieres();
  }, []);

  // Fetch courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const url = selectedMatiereId
          ? `http://localhost:5000/api/cours?matiere_id=${selectedMatiereId}`
          : 'http://localhost:5000/api/cours';
        const response = await axios.get(url);
        setCourses(response.data);

        const selectedMatiere = matieres.find((matiere) => matiere.id === parseInt(selectedMatiereId));
        setSelectedMatiereName(selectedMatiere ? selectedMatiere.nom : '');
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      }
    };

    if (matieres.length > 0) {
      fetchCourses();
    }
  }, [selectedMatiereId, matieres]);

  // Handle image change
  const handleImageChange = (e) => {
    setNewCourse((prev) => ({ ...prev, image: e.target.files[0] }));
  };

  // Add course
  const handleAddCourse = async () => {
    try {
      const formData = new FormData();
      formData.append('titre', newCourse.titre);
      formData.append('description', newCourse.description);
      formData.append('prix', newCourse.prix);
      formData.append('module', newCourse.module);
      formData.append('status', newCourse.status);
      formData.append('matiere_id', newCourse.matiere_id);
      if (newCourse.image) {
        formData.append('image', newCourse.image);
      }

      const response = await axios.post('http://localhost:5000/api/cours', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setCourses([...courses, response.data.course]);
      setNewCourse({
        titre: '',
        description: '',
        prix: '',
        module: '',
        status: 'Gratuit',
        matiere_id: '',
        image: null,
      });
      setShowModal(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  // Edit course
  const handleEditCourse = (course) => {
    setEditCourse(course);
    setNewCourse({
      titre: course.titre,
      description: course.description,
      prix: course.prix,
      module: course.module,
      status: course.status,
      matiere_id: course.matiere_id,
      image: course.image,
    });
    setShowModal(true);
  };

  // Update course
  const handleUpdateCourse = async () => {
    try {
      const formData = new FormData();
      formData.append('titre', newCourse.titre);
      formData.append('description', newCourse.description);
      formData.append('prix', newCourse.prix);
      formData.append('module', newCourse.module);
      formData.append('status', newCourse.status);
      formData.append('matiere_id', newCourse.matiere_id);
      if (newCourse.image && typeof newCourse.image !== 'string') {
        formData.append('image', newCourse.image);
      }

      const response = await axios.put(`http://localhost:5000/api/cours/${editCourse.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setCourses(
        courses.map((course) =>
          course.id === editCourse.id ? response.data.course : course
        )
      );
      setNewCourse({
        titre: '',
        description: '',
        prix: '',
        module: '',
        status: 'Gratuit',
        matiere_id: '',
        image: null,
      });
      setEditCourse(null);
      setShowModal(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  // Delete course
  const handleDeleteCourse = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/cours/${id}`);
      setCourses(courses.filter((course) => course.id !== id));
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  // Reset modal
  const handleCloseModal = () => {
    setShowModal(false);
    setNewCourse({
      titre: '',
      description: '',
      prix: '',
      module: '',
      status: 'Gratuit',
      matiere_id: '',
      image: null,
    });
    setEditCourse(null);
    setError(null);
  };

  return (
    <div className="card p-3">
      <h5>Gestion des cours</h5>

      <Form.Group className="mb-3">
        <Form.Label>Sélectionner une matière</Form.Label>
        <Form.Select
          value={selectedMatiereId}
          onChange={(e) => setSelectedMatiereId(e.target.value)}
        >
          <option value="">Toutes les matières</option>
          {matieres.map((matiere) => (
            <option key={matiere.id} value={matiere.id}>
              {matiere.nom}
            </option>
          ))}
        </Form.Select>
      </Form.Group>

      <Button variant="primary" onClick={() => setShowModal(true)} className="mb-3">
        <FaPlus /> Ajouter un cours
      </Button>

      {selectedMatiereId && (
        <h6 className="mb-3">
          Cours pour la matière : <strong>{selectedMatiereName}</strong>
        </h6>
      )}

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Titre</th>
            <th>Description</th>
            <th>Prix</th>
            <th>Module</th>
            <th>Statut</th>
            <th>Matière</th>
            <th>Créateur</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course) => (
            <tr key={course.id}>
              <td>{course.id}</td>
              <td>{course.titre}</td>
              <td>{course.description}</td>
              <td>{course.prix}</td>
              <td>{course.module}</td>
              <td>{course.status}</td>
              <td>{course.Matiere ? course.Matiere.nom : 'N/A'}</td>
              <td>
                {course.Creator ? `${course.Creator.prenom} ${course.Creator.nom}` : 'N/A'}
              </td>
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

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{editCourse ? 'Modifier le cours' : 'Ajouter un cours'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Titre du cours</Form.Label>
              <Form.Control
                type="text"
                value={newCourse.titre}
                onChange={(e) =>
                  setNewCourse({ ...newCourse, titre: e.target.value })
                }
                required
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
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Prix</Form.Label>
              <Form.Control
                type="number"
                value={newCourse.prix}
                onChange={(e) =>
                  setNewCourse({ ...newCourse, prix: e.target.value })
                }
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Module</Form.Label>
              <Form.Control
                type="text"
                value={newCourse.module}
                onChange={(e) =>
                  setNewCourse({ ...newCourse, module: e.target.value })
                }
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Statut</Form.Label>
              <Form.Select
                value={newCourse.status}
                onChange={(e) =>
                  setNewCourse({ ...newCourse, status: e.target.value })
                }
              >
                <option value="Gratuit">Gratuit</option>
                <option value="Payé">Payé</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Matière</Form.Label>
              <Form.Select
                value={newCourse.matiere_id}
                onChange={(e) =>
                  setNewCourse({ ...newCourse, matiere_id: e.target.value })
                }
                required
              >
                <option value="">Sélectionner une matière</option>
                {matieres.map((matiere) => (
                  <option key={matiere.id} value={matiere.id}>
                    {matiere.nom}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Image</Form.Label>
              <Form.Control
                type="file"
                name="image"
                onChange={handleImageChange}
                accept="image/*"
              />
              {editCourse && newCourse.image && typeof newCourse.image === 'string' && (
                <div className="mt-2">
                  <p>Image actuelle :</p>
                  <img
                    src={`http://localhost:5000/Uploads/${newCourse.image}`}
                    alt="Aperçu"
                    style={{ maxWidth: '100px', maxHeight: '100px' }}
                  />
                </div>
              )}
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Annuler
          </Button>
          <Button
            variant="primary"
            onClick={editCourse ? handleUpdateCourse : handleAddCourse}
            disabled={!newCourse.matiere_id || !newCourse.titre || !newCourse.description}
          >
            {editCourse ? 'Modifier' : 'Ajouter'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CourseManager;