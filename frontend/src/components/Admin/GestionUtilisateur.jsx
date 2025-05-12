import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaEdit } from 'react-icons/fa';
import { Button, Table, Modal, Form, OverlayTrigger, Tooltip, Alert } from 'react-bootstrap';
import axios from 'axios';
import profil from '../images/businessman-310819_1280.png';
import './user.css';

function GestionUtilisateur() {
  const [activeTab, setActiveTab] = useState('teachers');
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [levels, setLevels] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [status, setStatus] = useState('');
  const [newUser, setNewUser] = useState({
    prenom: '',
    nom: '',
    email: '',
    mot_de_passe: '',
    id_role: '',
    niveau_id: '',
    classe_ids: [],
    matiere_id: ''
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [teachersResponse, studentsResponse, levelsResponse, subjectsResponse] = await Promise.all([
          axios.get('http://localhost:5000/api/users/teachers'),
          axios.get('http://localhost:5000/api/users/students'),
          axios.get('http://localhost:5000/api/niveaux'),
          axios.get('http://localhost:5000/api/matieres')
        ]);
        setTeachers(teachersResponse.data);
        setStudents(studentsResponse.data);
        setAllStudents(studentsResponse.data);
        setLevels(levelsResponse.data);
        setSubjects(subjectsResponse.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Erreur lors du chargement des données.');
        setLoading(false);
      }
    };
    fetchData();
  }, [activeTab]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedUser(null);
    setError(null);
  };

  const validatePassword = (password) => /^.{6,}$/.test(password);

  const handleAddUser = async () => {
    if (!validatePassword(newUser.mot_de_passe)) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    try {
      const userData = { 
        ...newUser, 
        id_role: activeTab === 'teachers' ? 1003 : 2,
        niveau_id: activeTab === 'teachers' ? newUser.niveau_id : undefined,
        classe_ids: activeTab === 'teachers' ? newUser.classe_ids : undefined,
        matiere_id: activeTab === 'teachers' ? newUser.matiere_id : undefined
      };
      const response = await axios.post('http://localhost:5000/api/users/addUser', userData);
      const newUserData = response.data.data;
      if (activeTab === 'teachers') {
        setTeachers([...teachers, newUserData]);
      } else {
        setStudents([...students, newUserData]);
        setAllStudents([...allStudents, newUserData]);
      }
      setShowAddModal(false);
      setNewUser({
        prenom: '',
        nom: '',
        email: '',
        mot_de_passe: '',
        id_role: '',
        niveau_id: '',
        classe_ids: [],
        matiere_id: ''
      });
      setError(null);
    } catch (error) {
      console.error('Error adding user:', error.response?.data || error.message);
      setError(error.response?.data?.error || 'Erreur lors de l’ajout de l’utilisateur.');
    }
  };

  const handleUpdate = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/users/${id}`, { status });
      const updatedUsers = activeTab === 'teachers' ? teachers : students;
      const updatedList = updatedUsers.map((user) =>
        user.id === id ? { ...user, status } : user
      );
      if (activeTab === 'teachers') {
        setTeachers(updatedList);
      } else {
        setStudents(updatedList);
        setAllStudents(updatedList);
      }
      setShowUpdateModal(false);
      setError(null);
    } catch (error) {
      console.error('Error updating user:', error);
      setError('Erreur lors de la mise à jour de l’utilisateur.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer cet ${activeTab === 'teachers' ? 'enseignant' : 'étudiant'} ?`)) {
      try {
        await axios.delete(`http://localhost:5000/api/users/${id}`);
        if (activeTab === 'teachers') {
          setTeachers((prev) => prev.filter((teacher) => teacher.id !== id));
        } else {
          setStudents((prev) => prev.filter((student) => student.id !== id));
          setAllStudents((prev) => prev.filter((student) => student.id !== id));
        }
        setError(null);
      } catch (error) {
        console.error('Error deleting user:', error);
        setError('Erreur lors de la suppression de l’utilisateur.');
      }
    }
  };

  const handleLevelChange = async (e) => {
    const niveau_id = e.target.value;
    setNewUser({ ...newUser, niveau_id, classe_ids: [] });
    if (niveau_id) {
      const classesResponse = await axios.get(`http://localhost:5000/api/classes/niveau/${niveau_id}`);
      setClasses(classesResponse.data);
    } else {
      setClasses([]);
    }
  };

  const handleClassChange = (e) => {
    const { options } = e.target;
    const selectedClasses = Array.from(options)
      .filter(option => option.selected)
      .map(option => option.value);
    setNewUser({ ...newUser, classe_ids: selectedClasses });
  };

const renderTable = (users, title) => {
  console.log('Users data:', users); // Debug log
  return (
    <div className="mb-5">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="section-title">{title}</h4>
        <Button
          className="custom-btn"
          variant="primary"
          onClick={() => setShowAddModal(true)}
        >
          <FaPlus className="me-2" /> Ajouter un nouvel {activeTab === 'teachers' ? 'enseignant' : 'étudiant'}
        </Button>
      </div>
      <Table className="custom-table">
        <thead>
          <tr>
            <th>{activeTab === 'teachers' ? 'ENSEIGNANT' : 'ÉTUDIANT'}</th>
            <th>Email</th>
            {activeTab === 'teachers' && <th>Niveau</th>}
            {activeTab === 'teachers' && <th>Classes</th>}
            {activeTab === 'teachers' && <th>Matière</th>}
            <th>STATUT</th>
            <th className="text-end">ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? (
            users.map((user) => (
              <tr key={user.id}>
                <td>
                  <div className="d-flex align-items-center">
                    <img
                      src={user.photo || profil}
                      alt={user.prenom}
                      className="student-avatar rounded-circle me-3"
                    />
                    <span className="fw-semibold text-dark">{user.prenom} {user.nom}</span>
                  </div>
                </td>
                <td className="text-muted">{user.email}</td>
                {activeTab === 'teachers' && <td className="text-muted">{user.niveau_nom || '-'}</td>}
                {activeTab === 'teachers' && <td className="text-muted">{(user.classe_noms || []).join(', ') || '-'}</td>}
                {activeTab === 'teachers' && <td className="text-muted">{user.matiere_nom || '-'}</td>}
                <td className="text-muted">{user.status || 'pending'}</td>
                <td className="text-end">
                  <OverlayTrigger placement="top" overlay={<Tooltip>Modifier le statut</Tooltip>}>
                    <Button
                      variant="link"
                      className="text-muted action-btn"
                      onClick={() => {
                        setSelectedUser(user);
                        setStatus(user.status || 'pending');
                        setShowUpdateModal(true);
                      }}
                    >
                      <FaEdit />
                    </Button>
                  </OverlayTrigger>
                  <OverlayTrigger placement="top" overlay={<Tooltip>Supprimer</Tooltip>}>
                    <Button
                      variant="link"
                      className="text-muted action-btn"
                      onClick={() => handleDelete(user.id)}
                    >
                      <FaTrash />
                    </Button>
                  </OverlayTrigger>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={activeTab === 'teachers' ? 7 : 5} className="text-center text-muted">
                Aucun {activeTab === 'teachers' ? 'enseignant' : 'étudiant'}
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

  if (loading) {
    return (
      <div className="text-center my-5">
        <h5 className="text-muted">Chargement...</h5>
      </div>
    );
  }

  return (
    <div className="gestion-utilisateur">
      {error && <Alert variant="danger">{error}</Alert>}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'teachers' ? 'active' : ''}`}
          onClick={() => handleTabChange('teachers')}
        >
          Gestion Enseignant
        </button>
        <button
          className={`tab ${activeTab === 'students' ? 'active' : ''}`}
          onClick={() => handleTabChange('students')}
        >
          Gestion Étudiant
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'teachers' && renderTable(teachers, 'Enseignants')}
        {activeTab === 'students' && renderTable(students, 'Étudiants')}

        <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Ajouter un nouvel {activeTab === 'teachers' ? 'enseignant' : 'étudiant'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form>
              <Form.Group controlId="formUserPrenom" className="mb-3">
                <Form.Label className="form-label">Prénom</Form.Label>
                <Form.Control
                  type="text"
                  value={newUser.prenom}
                  onChange={(e) => setNewUser({ ...newUser, prenom: e.target.value })}
                  placeholder="Entrez le prénom"
                  className="form-control w-50"
                />
              </Form.Group>
              <Form.Group controlId="formUserNom" className="mb-3">
                <Form.Label className="form-label">Nom</Form.Label>
                <Form.Control
                  type="text"
                  value={newUser.nom}
                  onChange={(e) => setNewUser({ ...newUser, nom: e.target.value })}
                  placeholder="Entrez le nom"
                  className="form-control w-50"
                />
              </Form.Group>
              <Form.Group controlId="formUserEmail" className="mb-3">
                <Form.Label className="form-label">Email</Form.Label>
                <Form.Control
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="Entrez l'email"
                  className="form-control w-50"
                />
              </Form.Group>
              <Form.Group controlId="formUserPassword" className="mb-3">
                <Form.Label className="form-label">Mot de passe</Form.Label>
                <Form.Control
                  type="password"
                  value={newUser.mot_de_passe}
                  onChange={(e) => setNewUser({ ...newUser, mot_de_passe: e.target.value })}
                  placeholder="Entrez le mot de passe"
                  className="form-control w-50"
                />
              </Form.Group>
              {activeTab === 'teachers' && (
                <>
                  <Form.Group controlId="formUserNiveau" className="mb-3">
                    <Form.Label className="form-label">Niveau</Form.Label>
                    <Form.Control
                      as="select"
                      value={newUser.niveau_id}
                      onChange={handleLevelChange}
                      className="form-control w-50"
                    >
                      <option value="">Sélectionner un niveau</option>
                      {levels.map(level => (
                        <option key={level.id} value={level.id}>{level.nom}</option>
                      ))}
                    </Form.Control>
                  </Form.Group>
                  <Form.Group controlId="formUserClasses" className="mb-3">
                    <Form.Label className="form-label">Classes</Form.Label>
                    <Form.Control
                      as="select"
                      multiple
                      value={newUser.classe_ids}
                      onChange={handleClassChange}
                      className="form-control w-50"
                      size={5}
                    >
                      {classes.map(classe => (
                        <option key={classe.id} value={classe.id}>{classe.nom}</option>
                      ))}
                    </Form.Control>
                  </Form.Group>
                  <Form.Group controlId="formUserMatiere" className="mb-3">
                    <Form.Label className="form-label">Matière</Form.Label>
                    <Form.Control
                      as="select"
                      value={newUser.matiere_id}
                      onChange={(e) => setNewUser({ ...newUser, matiere_id: e.target.value })}
                      className="form-control w-50"
                    >
                      <option value="">Sélectionner une matière</option>
                      {subjects.map(subject => (
                        <option key={subject.id} value={subject.id}>{subject.nom}</option>
                      ))}
                    </Form.Control>
                  </Form.Group>
                </>
              )}
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Fermer
            </Button>
            <Button
              variant="primary"
              onClick={handleAddUser}
              disabled={!newUser.prenom || !newUser.nom || !newUser.email || !newUser.mot_de_passe || 
                (activeTab === 'teachers' && (!newUser.niveau_id || newUser.classe_ids.length === 0 || !newUser.matiere_id))}
              className="custom-btn"
            >
              Ajouter
            </Button>
          </Modal.Footer>
        </Modal>

        <Modal show={showUpdateModal} onHide={() => setShowUpdateModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Mettre à jour le statut</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group controlId="formStatus" className="mb-3">
                <Form.Label className="form-label">Statut</Form.Label>
                <Form.Control
                  as="select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="form-control w-50"
                >
                  <option value="approved">Approuvé</option>
                  <option value="pending">En attente</option>
                  <option value="rejected">Rejeté</option>
                </Form.Control>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowUpdateModal(false)}>
              Fermer
            </Button>
            <Button
              variant="primary"
              onClick={() => { if (selectedUser) handleUpdate(selectedUser.id); }}
              className="custom-btn"
            >
              Sauvegarder
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
}

export default GestionUtilisateur;