import React, { useEffect, useState } from 'react';
import { FaUsers, FaClock, FaPlus, FaEdit, FaTrash, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { Button, Card, ProgressBar, Modal, Form  } from 'react-bootstrap';
import axios from 'axios';
import'./Course.css'

function CourseCard({ course }) {
  return (
    <Card className="course-card shadow-sm border-0 rounded-4 overflow-hidden mb-4">
      <Card.Img 
        variant="top" 
        src={`http://localhost:5000/uploads/${course.image}`} 
        alt={course.titre} 
        className="course-card-img"
      />

      <Card.Body className="p-4">
        <Card.Title className="mb-1 fw-bold fs-4">{course.titre}</Card.Title>
        <Card.Subtitle className="mb-3 text-muted">{course.instructor || 'Instructeur inconnu'}</Card.Subtitle>

        <div className="d-flex justify-content-between mb-3 text-secondary small">
          <div className="d-flex align-items-center gap-2">
            <FaUsers className="text-info" />
            <span>{course.students || 0} étudiants</span>
          </div>
          <div className="d-flex align-items-center gap-2">
            <FaClock className="text-info" />
            <span>{course.duration || 'Durée inconnue'}</span>
          </div>
        </div>

        <div className="mb-3">
          <div className="d-flex justify-content-between small text-muted mb-1">
            <span>Progression</span>
            <span>{course.progress || 0}%</span>
          </div>
          <ProgressBar 
            now={course.progress || 0} 
            variant="info" 
            className="progress-bar-rounded" 
          />
        </div>

        <div className="d-flex justify-content-end gap-2">
          <Button variant="outline-info" size="sm">Voir les détails</Button>
          <Button variant="info" size="sm">Modifier</Button>
        </div>
      </Card.Body>
    </Card>
  );
}



function Courses() {
  const [matieres, setMatieres] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [showModal, setShowModal] = useState(false); 
  const [editModal, setEditModal] = useState(false); 
  const [newMatiere, setNewMatiere] = useState({ nom: '', description: '', image: null });
  const [editMatiere, setEditMatiere] = useState({ id: '', nom: '', description: '', image: null }); 

  useEffect(() => {
    axios
      .get('http://localhost:5000/api/matieres')
      .then(async (response) => {
        console.log('Matieres Data:', response.data);
        const matieresData = response.data;
        const matieresWithCourses = await Promise.all(
          matieresData.map(async (matiere) => {
            const coursResponse = await axios.get(`http://localhost:5000/api/cours?matiere_id=${matiere.id}`);
            return { ...matiere, courses: coursResponse.data, isCoursesCollapsed: false };
          })
        );
        setMatieres(matieresWithCourses);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération des matières:", error);
        setLoading(false);
      });
  }, []);

  // Handle modal open/close for adding
  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  // Handle modal open/close for editing
  const handleShowEditModal = (matiere) => {
    setEditMatiere({ id: matiere.id, nom: matiere.nom, description: matiere.description, image: null });
    setEditModal(true);
  };
  const handleCloseEditModal = () => setEditModal(false);

  // Handle form input changes for adding
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewMatiere((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form input changes for editing
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditMatiere((prev) => ({ ...prev, [name]: value }));
  };

  // Handle image file upload for adding
  const handleImageChange = (e) => {
    setNewMatiere((prev) => ({ ...prev, image: e.target.files[0] }));
  };

  // Handle image file upload for editing
  const handleEditImageChange = (e) => {
    setEditMatiere((prev) => ({ ...prev, image: e.target.files[0] }));
  };

  // Submit new matiere
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('nom', newMatiere.nom);
    formData.append('description', newMatiere.description);
    if (newMatiere.image) formData.append('image', newMatiere.image);

    try {
      const response = await axios.post('http://localhost:5000/api/matieres', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMatieres((prev) => [...prev, { ...response.data.matiere, courses: [], isCoursesCollapsed: false }]);
      setNewMatiere({ nom: '', description: '', image: null });
      handleCloseModal();
    } catch (error) {
      console.error("Erreur lors de la création de la matière:", error);
    }
  };

  // Submit updated matiere
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('nom', editMatiere.nom);
    formData.append('description', editMatiere.description);
    if (editMatiere.image) formData.append('image', editMatiere.image);

    try {
      const response = await axios.put(`http://localhost:5000/api/matieres/${editMatiere.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMatieres((prev) =>
        prev.map((m) => (m.id === editMatiere.id ? { ...m, ...response.data.matiere } : m))
      );
      handleCloseEditModal();
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la matière:", error);
    }
  };

  // Delete matiere
  const handleDelete = async (id) => {
    if (window.confirm("Voulez-vous vraiment supprimer cette matière ?")) {
      try {
        await axios.delete(`http://localhost:5000/api/matieres/${id}`);
        setMatieres((prev) => prev.filter((m) => m.id !== id));
      } catch (error) {
        console.error("Erreur lors de la suppression de la matière:", error);
      }
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
    <div className="container my-5">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <h1 className="mb-1">📚Cours</h1>
        </div>
      </div>

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
              <div className="d-flex gap-2">
                <FaEdit
                  className="text-white cursor-pointer"
                  size={20}
                  title="Modifier"
                  onClick={() => handleShowEditModal(matiere)}
                />
                <FaTrash
                  className="text-white cursor-pointer"
                  size={20}
                  title="Supprimer"
                  onClick={() => handleDelete(matiere.id)}
                />
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
                  <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                    {matiere.courses.map((course) => (
                      <div className="col" key={course.id}>
                        <CourseCard course={course} />
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



 
    </div>
  );
}

export default Courses;