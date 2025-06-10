import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Modal } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Course.css';

const CourseManager = () => {
  const [courses, setCourses] = useState([]);
  const [matieres, setMatieres] = useState([]);
  const [niveaux, setNiveaux] = useState([]);
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
    niveau_id: '',
    image: null,
    files: [],
    video: null,
    clearFiles: false,
    clearVideo: false,
  });
  const [editCourse, setEditCourse] = useState(null);
  const [error, setError] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();

  // Fetch matières and niveaux
  useEffect(() => {
    const fetchMatieresAndNiveaux = async () => {
      try {
        const [matieresResponse, niveauxResponse] = await Promise.all([
          axios.get('http://localhost:5000/api/matieres', { withCredentials: true }),
          axios.get('http://localhost:5000/api/niveaux', { withCredentials: true }),
        ]);
        setMatieres(matieresResponse.data);
        setNiveaux(niveauxResponse.data);
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          localStorage.removeItem('userId');
          navigate('/login');
        } else {
          setError(err.response?.data?.message || 'Erreur lors du chargement des données');
        }
      }
    };
    fetchMatieresAndNiveaux();
  }, [navigate]);

  // Fetch courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const url = selectedMatiereId
          ? `http://localhost:5000/api/cours?matiere_id=${selectedMatiereId}`
          : 'http://localhost:5000/api/cours';
        const response = await axios.get(url, { withCredentials: true });
        setCourses(response.data);

        const selectedMatiere = matieres.find((matiere) => matiere.id === parseInt(selectedMatiereId));
        setSelectedMatiereName(selectedMatiere ? selectedMatiere.nom : '');
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          localStorage.removeItem('userId');
          navigate('/login');
        } else {
          setError(err.response?.data?.message || 'Erreur lors du chargement des cours');
        }
      }
    };

    if (matieres.length > 0) {
      fetchCourses();
    }
  }, [selectedMatiereId, matieres, navigate]);

  const generateAICourseContent = async () => {
    if (!newCourse.matiere_id || !newCourse.niveau_id) {
      setError('Veuillez sélectionner une matière et un niveau avant de générer le contenu.');
      return;
    }

    setIsGenerating(true);
    setError(null);
    try {
      const response = await axios.post(
        'http://localhost:5000/api/cours/generate-course-content',
        {
          matiere_id: parseInt(newCourse.matiere_id),
          niveau_id: parseInt(newCourse.niveau_id),
        },
        {
          withCredentials: true,
          headers: { 'Content-Type': 'application/json' },
          timeout: 120000,
        }
      );

      const aiContent = response.data;

      if (!aiContent.titre || !aiContent.description || !aiContent.module) {
        throw new Error('Contenu NLP incomplet ou mal formé');
      }

      let imageFile = null;
      let pdfFile = null;
      let videoFile = null;

      if (aiContent.image_path) {
        const imgResponse = await fetch(`http://localhost:5000/Uploads/${aiContent.image_path}`);
        if (!imgResponse.ok) throw new Error('Failed to fetch generated image');
        const imgBlob = await imgResponse.blob();
        imageFile = new File([imgBlob], aiContent.image_path, { type: 'image/png' });
      }

      if (aiContent.pdf_path) {
        const pdfResponse = await fetch(`http://localhost:5000/Uploads/${aiContent.pdf_path}`);
        if (!pdfResponse.ok) throw new Error('Failed to fetch generated PDF');
        const pdfBlob = await pdfResponse.blob();
        pdfFile = new File([pdfBlob], aiContent.pdf_path, { type: 'application/pdf' });
      }

      if (aiContent.video_path) {
        const videoResponse = await fetch(`http://localhost:5000/Uploads/${aiContent.video_path}`);
        if (!videoResponse.ok) throw new Error('Failed to fetch generated video');
        const videoBlob = await videoResponse.blob();
        videoFile = new File([videoBlob], aiContent.video_path, { type: 'video/mp4' });
      }

      setNewCourse((prev) => ({
        ...prev,
        titre: aiContent.titre.substring(0, 255),
        description: aiContent.description,
        module: aiContent.module,
        image: imageFile || prev.image,
        files: pdfFile ? [pdfFile] : prev.files,
        video: videoFile || prev.video,
      }));
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('userId');
        navigate('/login');
      } else {
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          'Erreur inconnue lors de la génération du contenu NLP';
        const rawOutput = err.response?.data?.rawOutput || 'Aucune sortie brute disponible';
        setError(`Erreur: ${errorMessage}. Détails: ${rawOutput}`);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImageChange = (e) => {
    setNewCourse((prev) => ({ ...prev, image: e.target.files[0] }));
  };

  const handleFilesChange = (e) => {
    setNewCourse((prev) => ({ ...prev, files: Array.from(e.target.files) }));
  };

  const handleVideoChange = (e) => {
    setNewCourse((prev) => ({ ...prev, video: e.target.files[0] }));
  };

  const handleAddCourse = async () => {
    try {
      const formData = new FormData();
      formData.append('titre', newCourse.titre || '');
      formData.append('description', newCourse.description || '');
      formData.append('prix', newCourse.prix || '0');
      formData.append('module', newCourse.module || '');
      formData.append('status', newCourse.status);
      formData.append('matiere_id', newCourse.matiere_id);
      formData.append('niveau_id', newCourse.niveau_id);
      if (newCourse.image) {
        formData.append('image', newCourse.image);
      }
      if (newCourse.files) {
        newCourse.files.forEach((file) => formData.append('files', file));
      }
      if (newCourse.video) {
        formData.append('video', newCourse.video);
      }

      const response = await axios.post('http://localhost:5000/api/cours', formData, {
        withCredentials: true,
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
        niveau_id: '',
        image: null,
        files: [],
        video: null,
        clearFiles: false,
        clearVideo: false,
      });
      setShowModal(false);
      setError(null);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('userId');
        navigate('/login');
      } else {
        setError(err.response?.data?.message || 'Erreur lors de l’ajout du cours');
      }
    }
  };

  const handleEditCourse = (course) => {
    let filesArray = [];
    if (course.files) {
      if (Array.isArray(course.files)) {
        filesArray = course.files;
      } else if (typeof course.files === 'string') {
        try {
          filesArray = JSON.parse(course.files);
          if (!Array.isArray(filesArray)) {
            filesArray = [];
          }
        } catch (e) {
          console.error('Error parsing course.files:', e);
          filesArray = [];
        }
      }
    }
    setEditCourse(course);
    setNewCourse({
      titre: course.titre,
      description: course.description,
      prix: course.prix,
      module: course.module,
      status: course.status,
      matiere_id: course.matiere_id || '',
      niveau_id: course.niveau_id || '',
      image: course.image,
      files: filesArray,
      video: course.video,
      clearFiles: false,
      clearVideo: false,
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
      formData.append('niveau_id', newCourse.niveau_id);
      formData.append('clearFiles', newCourse.clearFiles ? 'true' : 'false');
      formData.append('clearVideo', newCourse.clearVideo ? 'true' : 'false');
      if (newCourse.image && typeof newCourse.image !== 'string') {
        formData.append('image', newCourse.image);
      }
      if (newCourse.files && newCourse.files.length > 0) {
        newCourse.files.forEach((file) => {
          if (typeof file !== 'string') {
            formData.append('files', file);
          }
        });
      }
      if (newCourse.video && typeof newCourse.video !== 'string') {
        formData.append('video', newCourse.video);
      }

      const response = await axios.put(`http://localhost:5000/api/cours/${editCourse.id}`, formData, {
        withCredentials: true,
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
        niveau_id: '',
        image: null,
        files: [],
        video: null,
        clearFiles: false,
        clearVideo: false,
      });
      setEditCourse(null);
      setShowModal(false);
      setError(null);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('userId');
        navigate('/login');
      } else {
        setError(err.response?.data?.message || 'Erreur lors de la mise à jour du cours');
      }
    }
  };

  const handleDeleteCourse = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/cours/${id}`, { withCredentials: true });
      setCourses(courses.filter((course) => course.id !== id));
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('userId');
        navigate('/login');
      } else {
        setError(err.response?.data?.message || 'Erreur lors de la suppression du cours');
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setNewCourse({
      titre: '',
      description: '',
      prix: '',
      module: '',
      status: 'Gratuit',
      matiere_id: '',
      niveau_id: '',
      image: null,
      files: [],
      video: null,
      clearFiles: false,
      clearVideo: false,
    });
    setEditCourse(null);
    setError(null);
  };

  return (
    <div className="course-container">
      <div className="card">
        <h5 className="card1-title">Gestion des cours</h5>
        <div className="filter-and-button">
          <Form.Group className="matiere-filter">
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
          <Button variant="primary" onClick={() => setShowModal(true)} className="compact-btn">
            <FaPlus /> Ajouter
          </Button>
        </div>

        {selectedMatiereId && (
          <h6 className="mb-3">
            Cours pour la matière : <strong>{selectedMatiereName}</strong>
          </h6>
        )}

        {error && (
          <div className="error-alert">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-11a1 1 0 112 0v4a1 1 0 11-2 0V7zm1 8a1 1 0 100-2 1 1 0 000 2z"
                clipRule="evenodd"
              />
            </svg>
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
              <th>Niveau</th>
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
                <td>
                  <span className={`status-badge status-${course.status.toLowerCase()}`}>
                    {course.status}
                  </span>
                </td>
                <td>{course.Matiere ? course.Matiere.nom : 'N/A'}</td>
                <td>{course.Niveau ? course.Niveau.nom : 'N/A'}</td>
                <td>
                  {course.Creator ? `${course.Creator.prenom} ${course.Creator.nom}` : 'N/A'}
                </td>
                <td className="d-flex align-items-center gap-2">
                  <Button
                    variant="warning"
                    onClick={() => handleEditCourse(course)}
                    className="action-btn"
                  >
                    <FaEdit />
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleDeleteCourse(course.id)}
                    className="action-btn"
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
              <Button
                variant="info"
                onClick={generateAICourseContent}
                disabled={isGenerating || !newCourse.matiere_id || !newCourse.niveau_id}
                className="mb-3"
              >
                {isGenerating ? 'Génération en cours...' : 'Générer contenu avec AI'}
              </Button>

              <div className="row mb-3">
                <Form.Group className="col-12">
                  <Form.Label>Titre du cours</Form.Label>
                  <Form.Control
                    type="text"
                    value={newCourse.titre}
                    onChange={(e) => setNewCourse({ ...newCourse, titre: e.target.value })}
                  />
                </Form.Group>
              </div>

              <div className="row mb-3">
                <Form.Group className="col-12">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={newCourse.description}
                    onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                  />
                </Form.Group>
              </div>

              <div className="row mb-3">
                <Form.Group className="col-md-6">
                  <Form.Label>Prix</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    value={newCourse.prix}
                    onChange={(e) => setNewCourse({ ...newCourse, prix: e.target.value })}
                  />
                </Form.Group>
                <Form.Group className="col-md-6">
                  <Form.Label>Module</Form.Label>
                  <Form.Control
                    type="text"
                    value={newCourse.module}
                    onChange={(e) => setNewCourse({ ...newCourse, module: e.target.value })}
                  />
                </Form.Group>
              </div>

              <div className="row mb-3">
                <Form.Group className="col-md-6">
                  <Form.Label>Statut</Form.Label>
                  <Form.Select
                    value={newCourse.status}
                    onChange={(e) => setNewCourse({ ...newCourse, status: e.target.value })}
                  >
                    <option value="Gratuit">Gratuit</option>
                    <option value="Payé">Payé</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group className="col-md-6">
                  <Form.Label>Matière</Form.Label>
                  <Form.Select
                    value={newCourse.matiere_id}
                    onChange={(e) => setNewCourse({ ...newCourse, matiere_id: e.target.value })}
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
              </div>

              <div className="row mb-3">
                <Form.Group className="col-md-6">
                  <Form.Label>Niveau</Form.Label>
                  <Form.Select
                    value={newCourse.niveau_id}
                    onChange={(e) => setNewCourse({ ...newCourse, niveau_id: e.target.value })}
                    required
                  >
                    <option value="">Sélectionner un niveau</option>
                    {niveaux.map((niveau) => (
                      <option key={niveau.id} value={niveau.id}>
                        {niveau.nom}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="col-md-6">
                  <Form.Label>Image</Form.Label>
                  <Form.Control
                    type="file"
                    name="image"
                    onChange={handleImageChange}
                    accept="image/*"
                  />
                  {(newCourse.image || (editCourse && newCourse.image)) && (
                    <div className="mt-2">
                      <p>Image actuelle :</p>
                      {typeof newCourse.image === 'string' ? (
                        <img
                          src={`http://localhost:5000/Uploads/${newCourse.image}`}
                          alt="Aperçu"
                          className="preview-media"
                        />
                      ) : (
                        <img
                          src={URL.createObjectURL(newCourse.image)}
                          alt="Aperçu"
                          className="preview-media"
                        />
                      )}
                    </div>
                  )}
                </Form.Group>
              </div>

              <div className="row mb-3">
                <Form.Group className="col-md-6">
                  <Form.Label>Fichiers (PDF, Word, etc.)</Form.Label>
                  <Form.Control
                    type="file"
                    name="files"
                    multiple
                    onChange={handleFilesChange}
                    accept=".pdf,.doc,.docx"
                  />
                  {(newCourse.files.length > 0 || (editCourse && Array.isArray(newCourse.files) && newCourse.files.length > 0)) && (
                    <div className="mt-2">
                      <p>Fichiers actuels :</p>
                      <ul>
                        {newCourse.files.map((file, index) => (
                          <li key={index}>
                            {typeof file === 'string' ? file : file.name}
                          </li>
                        ))}
                      </ul>
                      <Form.Check
                        type="checkbox"
                        label="Supprimer les fichiers existants"
                        checked={newCourse.clearFiles}
                        onChange={(e) =>
                          setNewCourse({ ...newCourse, clearFiles: e.target.checked })
                        }
                      />
                    </div>
                  )}
                </Form.Group>
                <Form.Group className="col-md-6">
                  <Form.Label>Vidéo</Form.Label>
                  <Form.Control
                    type="file"
                    name="video"
                    onChange={handleVideoChange}
                    accept="video/*"
                  />
                  {(newCourse.video || (editCourse && newCourse.video)) && (
                    <div className="mt-2">
                      <p>Vidéo actuelle :</p>
                      {typeof newCourse.video === 'string' ? (
                        <video
                          src={`http://localhost:5000/Uploads/${newCourse.video}`}
                          controls
                          className="preview-media"
                        />
                      ) : (
                        <video
                          src={URL.createObjectURL(newCourse.video)}
                          controls
                          className="preview-media"
                        />
                      )}
                      <Form.Check
                        type="checkbox"
                        label="Supprimer la vidéo existante"
                        checked={newCourse.clearVideo}
                        onChange={(e) =>
                          setNewCourse({ ...newCourse, clearVideo: e.target.checked })}
                      />
                    </div>
                  )}
                </Form.Group>
              </div>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={handleCloseModal}
              className="modal-btn modal-btn-secondary"
            >
              Annuler
            </Button>
            <Button
              variant="primary"
              onClick={editCourse ? handleUpdateCourse : handleAddCourse}
              className="modal-btn modal-btn-primary"
              disabled={!newCourse.matiere_id || !newCourse.niveau_id}
            >
              {editCourse ? 'Modifier le cours' : 'Ajouter'}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default CourseManager;