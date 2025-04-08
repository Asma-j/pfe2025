import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Modal } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

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
    image: null, // Initialiser comme null pour un fichier
  });
  const [editCourse, setEditCourse] = useState(null);
  const [error, setError] = useState(null);

  // Récupérer les matières au chargement
  useEffect(() => {
    const fetchMatieres = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/matieres');
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des matières');
        }
        const data = await response.json();
        setMatieres(data);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchMatieres();
  }, []);

  // Récupérer les cours en fonction de la matière sélectionnée
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const url = selectedMatiereId
          ? `http://localhost:5000/api/cours?matiere_id=${selectedMatiereId}`
          : 'http://localhost:5000/api/cours';
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des cours');
        }
        const data = await response.json();
        setCourses(data);

        const selectedMatiere = matieres.find((matiere) => matiere.id === parseInt(selectedMatiereId));
        setSelectedMatiereName(selectedMatiere ? selectedMatiere.nom : '');
      } catch (err) {
        setError(err.message);
      }
    };

    if (matieres.length > 0) {
      fetchCourses();
    }
  }, [selectedMatiereId, matieres]);

  // Gérer le changement de fichier image
  const handleImageChange = (e) => {
    setNewCourse((prev) => ({ ...prev, image: e.target.files[0] }));
  };

  // Ajouter un cours
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
        formData.append('image', newCourse.image); // Ajouter le fichier image
      }

      const response = await fetch('http://localhost:5000/api/cours/courses', {
        method: 'POST',
        body: formData, // Envoyer FormData au lieu de JSON
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la création du cours');
      }

      const data = await response.json();
      setCourses([...courses, data.course]);
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
      setError(err.message);
    }
  };

  // Modifier un cours
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
        formData.append('image', newCourse.image); // Ajouter la nouvelle image si elle a été modifiée
      }

      const response = await fetch(`http://localhost:5000/api/cours/${editCourse.id}`, {
        method: 'PUT',
        body: formData, // Envoyer FormData au lieu de JSON
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la mise à jour du cours');
      }

      const data = await response.json();
      setCourses(
        courses.map((course) =>
          course.id === editCourse.id ? data.course : course
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
      setError(err.message);
    }
  };

  // Supprimer un cours
  const handleDeleteCourse = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/cours/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la suppression du cours');
      }

      setCourses(courses.filter((course) => course.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="card p-3">
      <h5>Gestion des cours</h5>

      {/* Menu déroulant pour sélectionner une matière */}
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

      {/* Bouton pour ajouter un cours */}
      <Button variant="primary" onClick={() => setShowModal(true)} className="mb-3">
        <FaPlus /> Ajouter un cours
      </Button>

      {/* Afficher le nom de la matière sélectionnée */}
      {selectedMatiereId && (
        <h6 className="mb-3">
          Cours pour la matière : <strong>{selectedMatiereName}</strong>
        </h6>
      )}

      {/* Afficher les erreurs */}
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* Tableau des cours */}
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

      {/* Modal pour ajouter/modifier un cours */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
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
            <Form.Group className="mb-3">
              <Form.Label>Prix</Form.Label>
              <Form.Control
                type="number"
                value={newCourse.prix}
                onChange={(e) =>
                  setNewCourse({ ...newCourse, prix: e.target.value })
                }
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
              >
                <option value="">Sélectionner une matière</option>
                {matieres.map((matiere) => (
                  <option key={matiere.id} value={matiere.id}>
                    {matiere.nom}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3" controlId="formImage">
              <Form.Label>Image</Form.Label>
              <Form.Control type="file" name="image" onChange={handleImageChange} />
              {editCourse && newCourse.image && typeof newCourse.image === 'string' && (
                <div className="mt-2">
                  <p>Image actuelle :</p>
                  <img
                    src={`http://localhost:5000/uploads/${newCourse.image}`}
                    alt="Aperçu"
                    style={{ maxWidth: '100px', maxHeight: '100px' }}
                  />
                </div>
              )}
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
            disabled={!newCourse.matiere_id}
          >
            {editCourse ? 'Modifier' : 'Ajouter'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CourseManager;