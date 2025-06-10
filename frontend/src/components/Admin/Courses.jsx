import React, { useEffect, useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { Button, Card, Modal, Form } from 'react-bootstrap';
import axios from 'axios';
import CourseCard from './CourseCard';
import './Course.css';

function Courses() {
  const [matieres, setMatieres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [editCourse, setEditCourse] = useState({
    id: '',
    titre: '',
    description: '',
    prix: 0,
    module: '',
    status: 'Gratuit',
    matiere_id: '',
    niveau_id: '',
    image: null,
    files: [],
    video: null,
  });

  useEffect(() => {
    axios
      .get('http://localhost:5000/api/matieres')
      .then(async (response) => {
        const matieresData = response.data;
        const matieresWithCourses = await Promise.all(
          matieresData.map(async (matiere) => {
            const coursResponse = await axios.get(`http://localhost:5000/api/cours?matiere_id=${matiere.id}`);
            // Ensure files is an array for each course
            const courses = coursResponse.data.map((course) => ({
              ...course,
              files: Array.isArray(course.files)
                ? course.files
                : typeof course.files === 'string'
                ? JSON.parse(course.files)
                : [],
            }));
            return { ...matiere, courses, isCoursesCollapsed: false };
          })
        );
        setMatieres(matieresWithCourses);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Erreur lors de la récupération des matières:', error);
        setLoading(false);
      });
  }, []);

  // Handle course details modal
  const handleShowDetails = (course) => {
    // Ensure files is an array
    const normalizedCourse = {
      ...course,
      files: Array.isArray(course.files)
        ? course.files
        : typeof course.files === 'string'
        ? JSON.parse(course.files)
        : [],
    };
    setSelectedCourse(normalizedCourse);
    setShowDetailsModal(true);
  };

  const handleCloseDetails = () => {
    setShowDetailsModal(false);
    setSelectedCourse(null);
  };

  // Handle course edit modal
  const handleShowEdit = (course) => {
    setEditCourse({
      id: course.id,
      titre: course.titre,
      description: course.description,
      prix: course.prix,
      module: course.module,
      status: course.status,
      matiere_id: course.matiere_id,
      niveau_id: course.niveau_id,
      image: null,
      files: Array.isArray(course.files)
        ? course.files
        : typeof course.files === 'string'
        ? JSON.parse(course.files)
        : [],
      video: null,
    });
    setShowEditModal(true);
  };

  const handleCloseEdit = () => {
    setShowEditModal(false);
    setEditCourse({
      id: '',
      titre: '',
      description: '',
      prix: 0,
      module: '',
      status: 'Gratuit',
      matiere_id: '',
      niveau_id: '',
      image: null,
      files: [],
      video: null,
    });
  };

  // Handle edit form input changes
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditCourse((prev) => ({ ...prev, [name]: value }));
  };

  // Handle file uploads
  const handleEditFileChange = (e) => {
    const { name, files } = e.target;
    if (name === 'files') {
      setEditCourse((prev) => ({ ...prev, files: Array.from(files) }));
    } else {
      setEditCourse((prev) => ({ ...prev, [name]: files[0] }));
    }
  };

  // Submit edited course
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('titre', editCourse.titre);
    formData.append('description', editCourse.description);
    formData.append('prix', editCourse.prix);
    formData.append('module', editCourse.module);
    formData.append('status', editCourse.status);
    formData.append('matiere_id', editCourse.matiere_id);
    formData.append('niveau_id', editCourse.niveau_id);
    if (editCourse.image) formData.append('image', editCourse.image);
    editCourse.files.forEach((file) => formData.append('files', file));
    if (editCourse.video) formData.append('video', editCourse.video);

    try {
      const response = await axios.put(`http://localhost:5000/api/cours/${editCourse.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMatieres((prev) =>
        prev.map((matiere) => ({
          ...matiere,
          courses: matiere.courses.map((course) =>
            course.id === editCourse.id
              ? { ...course, ...response.data.course, files: Array.isArray(response.data.course.files) ? response.data.course.files : JSON.parse(response.data.course.files || '[]') }
              : course
          ),
        }))
      );
      handleCloseEdit();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du cours:', error);
    }
  };

  // Toggle collapse of course cards
  const toggleCoursesCollapse = (id) => {
    setMatieres((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isCoursesCollapsed: !m.isCoursesCollapsed } : m))
    );
  };

  if (loading) {
    return <div>Chargement des matières...</div>;
  }

  return (
    <div className="container my-4">
      <h2 className="mb-4">📚 Cours</h2>

      {matieres.map((matiere) => (
        <div key={matiere.id} className="mb-5">
          <Card className="shadow-sm border-0 rounded-4">
            <Card.Header className="bg-primary text-white d-flex align-items-center justify-content-between px-4 py-3 rounded-top">
              <div className="d-flex align-items-center">
                <img
                  src={`http://localhost:5000/uploads/${matiere.image}`}
                  alt={matiere.nom}
                  onError={(e) => (e.target.src = 'https://via.placeholder.com/100')}
                  style={{
                    width: '80px',
                    height: '80px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    marginRight: '20px',
                    border: '2px solid white',
                    boxShadow: '0 0 8px rgba(255,255,255,0.2)',
                  }}
                />
                <div>
                  <h3 className="mb-0">{matiere.nom}</h3>
                  <small className="text-light">{matiere.description || 'Aucune description disponible'}</small>
                </div>
              </div>
              <div>
                {matiere.isCoursesCollapsed ? (
                  <FaChevronDown
                    className="text-white cursor-pointer"
                    size={20}
                    title="Afficher les cours"
                    onClick={() => toggleCoursesCollapse(matiere.id)}
                  />
                ) : (
                  <FaChevronUp
                    className="text-white cursor-pointer"
                    size={20}
                    title="Masquer les cours"
                    onClick={() => toggleCoursesCollapse(matiere.id)}
                  />
                )}
              </div>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <p>{matiere.description || 'Aucune description disponible'}</p>
              </div>
              <h4>Cours associés :</h4>
              {!matiere.isCoursesCollapsed ? (
                matiere.courses.length > 0 ? (
                  <div className="row row-cols-1 row-cols-md-Born row-cols-lg-3 g-4">
                    {matiere.courses.map((course) => (
                      <div className="col" key={course.id}>
                        <CourseCard
                          course={course}
                          onShowDetails={handleShowDetails}
                          onShowEdit={handleShowEdit}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>Aucun cours disponible pour cette matière.</p>
                )
              ) : (
                <p className="text-muted">Cours masqués</p>
              )}
            </Card.Body>
          </Card>
        </div>
      ))}

      {/* Course Details Modal */}
      <Modal show={showDetailsModal} onHide={handleCloseDetails} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Détails du cours</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedCourse && (
            <div>
              <h4>{selectedCourse.titre}</h4>
              <p><strong>Description :</strong> {selectedCourse.description}</p>
              <p><strong>Instructeur :</strong> {selectedCourse.Creator ? `${selectedCourse.Creator.prenom} ${selectedCourse.Creator.nom}` : 'Inconnu'}</p>
              <p><strong>Prix :</strong> {selectedCourse.prix} €</p>
              <p><strong>Statut :</strong> {selectedCourse.status}</p>
              <p><strong>Module :</strong> {selectedCourse.module}</p>
              <p><strong>Niveau :</strong> {selectedCourse.Niveau?.nom || 'N/A'}</p>
              {Array.isArray(selectedCourse.files) && selectedCourse.files.length > 0 ? (
                <div>
                  <strong>Fichiers :</strong>
                  <ul>
                    {selectedCourse.files.map((file, index) => (
                      <li key={index}>
                        <a href={`http://localhost:5000/uploads/${file}`} target="_blank" rel="noopener noreferrer">
                          {file}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p><strong>Fichiers :</strong> Aucun fichier disponible</p>
              )}
              {selectedCourse.video && (
                <div>
                  <strong>Vidéo :</strong>
                  <video controls width="100%">
                    <source src={`http://localhost:5000/uploads/${selectedCourse.video}`} type="video/mp4" />
                    Votre navigateur ne supporte pas la lecture de vidéos.
                  </video>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDetails}>
            Fermer
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Course Edit Modal */}
      <Modal show={showEditModal} onHide={handleCloseEdit} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Modifier le cours</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleEditSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Titre</Form.Label>
              <Form.Control
                type="text"
                name="titre"
                value={editCourse.titre}
                onChange={handleEditInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                value={editCourse.description}
                onChange={handleEditInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Prix</Form.Label>
              <Form.Control
                type="number"
                name="prix"
                value={editCourse.prix}
                onChange={handleEditInputChange}
                min="0"
                step="0.01"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Module</Form.Label>
              <Form.Control
                type="text"
                name="module"
                value={editCourse.module}
                onChange={handleEditInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Statut</Form.Label>
              <Form.Select
                name="status"
                value={editCourse.status}
                onChange={handleEditInputChange}
              >
                <option value="Gratuit">Gratuit</option>
                <option value="Payé">Payé</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Image</Form.Label>
              <Form.Control
                type="file"
                name="image"
                accept="image/*"
                onChange={handleEditFileChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Fichiers (PDF, etc.)</Form.Label>
              <Form.Control
                type="file"
                name="files"
                accept=".pdf"
                multiple
                onChange={handleEditFileChange}
              />
              {editCourse.files.length > 0 && (
                <ul>
                  {editCourse.files.map((file, index) => (
                    <li key={index}>{typeof file === 'string' ? file : file.name}</li>
                  ))}
                </ul>
              )}
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Vidéo</Form.Label>
              <Form.Control
                type="file"
                name="video"
                accept="video/*"
                onChange={handleEditFileChange}
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              Enregistrer
            </Button>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseEdit}>
            Annuler
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Courses;