import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaEdit } from 'react-icons/fa';
import { Button, Table, Modal, Form, OverlayTrigger, Tooltip, Alert, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import profil from '../images/businessman-310819_1280.png';
import './user.css';

function GestionUtilisateur({ activeTab, setActiveTab }) {
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [levels, setLevels] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]); // All subjects fetched initially
  const [filteredSubjects, setFilteredSubjects] = useState([]); // Subjects filtered by niveau
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showAddStudentToClassModal, setShowAddStudentToClassModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [status, setStatus] = useState('');
  const [selectedClasse, setSelectedClasse] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [newUser, setNewUser] = useState({
    prenom: '',
    nom: '',
    email: '',
    mot_de_passe: '',
    id_role: '',
    niveau_id: '',
    classe_ids: [],
    matiere_ids: [] // Changed from matiere_id to matiere_ids for multiple selections
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [teachersResponse, studentsResponse, levelsResponse, subjectsResponse, classesResponse] = await Promise.all([
          axios.get('http://localhost:5000/api/users/teachers'),
          axios.get('http://localhost:5000/api/users/students'),
          axios.get('http://localhost:5000/api/niveaux'),
          axios.get('http://localhost:5000/api/matieres'),
          axios.get('http://localhost:5000/api/classes')
        ]);
        setTeachers(teachersResponse.data);
        setStudents(studentsResponse.data);
        setAllStudents(studentsResponse.data);
        setLevels(levelsResponse.data);
        setSubjects(subjectsResponse.data); // Store all subjects
        setFilteredSubjects(subjectsResponse.data); // Initially, filtered subjects are the same as all subjects
        setClasses(classesResponse.data);
        setFilteredStudents(studentsResponse.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Erreur lors du chargement des données.');
        setLoading(false);
      }
    };
    fetchData();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'students' && selectedClasse) {
      setLoading(true);
      axios
        .get(`http://localhost:5000/api/users/students/classe/${selectedClasse}`)
        .then((response) => {
          setFilteredStudents(response.data);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching students by classe:', error);
          setError('Erreur lors du chargement des étudiants.');
          setLoading(false);
        });
    } else {
      setFilteredStudents(students);
      setLoading(false);
    }
  }, [selectedClasse, students, activeTab]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedUser(null);
    setError(null);
    setSelectedClasse('');
    setFilteredSubjects(subjects); // Reset filtered subjects when switching tabs
    setNewUser({
      prenom: '',
      nom: '',
      email: '',
      mot_de_passe: '',
      id_role: '',
      niveau_id: '',
      classe_ids: [],
      matiere_ids: [] // Reset matiere_ids
    });
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
        niveau_id: activeTab === 'teachers' ? newUser.niveau_id : newUser.niveau_id || undefined,
        classe_ids: activeTab === 'teachers' ? newUser.classe_ids : undefined,
        matiere_ids: activeTab === 'teachers' ? newUser.matiere_ids : undefined // Send array of matiere_ids
      };
      const response = await axios.post('http://localhost:5000/api/users/addUser', userData);
      const newUserData = response.data.data;
      if (activeTab === 'teachers') {
        setTeachers([...teachers, newUserData]);
      } else {
        setStudents([...students, newUserData]);
        setAllStudents([...allStudents, newUserData]);
        setFilteredStudents([...students, newUserData]);
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
        matiere_ids: []
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
      const updatedUsers = activeTab === 'teachers' ? teachers : filteredStudents;
      const updatedList = updatedUsers.map((user) =>
        user.id === id ? { ...user, status } : user
      );
      if (activeTab === 'teachers') {
        setTeachers(updatedList);
      } else {
        setFilteredStudents(updatedList);
        setStudents(students.map((user) => (user.id === id ? { ...user, status } : user)));
        setAllStudents(allStudents.map((user) => (user.id === id ? { ...user, status } : user)));
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
          setFilteredStudents((prev) => prev.filter((student) => student.id !== id));
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
    setNewUser({ ...newUser, niveau_id, classe_ids: [], matiere_ids: [] }); // Reset classe_ids and matiere_ids
    try {
      if (niveau_id) {
        // Fetch classes for the selected niveau
        const classesResponse = await axios.get(`http://localhost:5000/api/classes/niveau/${niveau_id}`);
        setClasses(classesResponse.data);

        // Fetch subjects for the selected niveau
        const subjectsResponse = await axios.get(`http://localhost:5000/api/matieres/niveau/${niveau_id}`);
        setFilteredSubjects(subjectsResponse.data);
      } else {
        setClasses([]);
        setFilteredSubjects(subjects); // Reset to all subjects if no niveau is selected
      }
    } catch (error) {
      console.error('Error fetching classes or subjects:', error);
      setError('Erreur lors du chargement des classes ou des matières.');
    }
  };

  const handleAddStudentToClasse = async () => {
    try {
      await axios.post('http://localhost:5000/api/users/students/classe', {
        utilisateur_id: selectedStudentId,
        classe_id: selectedClasse,
      });
      const response = await axios.get(`http://localhost:5000/api/users/students/classe/${selectedClasse}`);
      setFilteredStudents(response.data);
      const updatedStudents = students.map((student) => {
        if (student.id === parseInt(selectedStudentId)) {
          return {
            ...student,
            classe_ids: [...(student.classe_ids || []), parseInt(selectedClasse)],
            classe_noms: [...(student.classe_noms || []), classes.find(c => c.id === parseInt(selectedClasse))?.nom]
          };
        }
        return student;
      });
      setStudents(updatedStudents);
      setAllStudents(updatedStudents);
      setShowAddStudentToClassModal(false);
      setSelectedStudentId('');
      setError(null);
    } catch (error) {
      console.error('Error adding student to classe:', error);
      setError('Erreur lors de l’ajout de l’étudiant à la classe.');
    }
  };

  const renderTable = (users, title) => {
    return (
      <div className="mb-5">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="section-title">{title}</h4>
          {activeTab === 'students' ? (
            <div>
              <Button
                className="custom-btn me-2"
                variant="primary"
                onClick={() => setShowAddModal(true)}
              >
                <FaPlus className="me-2" /> Ajouter un nouvel étudiant
              </Button>
              <Button
                className="custom-btn"
                variant="primary"
                onClick={() => setShowAddStudentToClassModal(true)}
                disabled={!selectedClasse}
              >
                <FaPlus className="me-2" /> Ajouter un étudiant à la classe
              </Button>
            </div>
          ) : (
            <Button
              className="custom-btn"
              variant="primary"
              onClick={() => setShowAddModal(true)}
            >
              <FaPlus className="me-2" /> Ajouter un nouvel enseignant
            </Button>
          )}
        </div>
        <Table className="custom-table">
          <thead>
            <tr>
              <th>{activeTab === 'teachers' ? 'ENSEIGNANT' : 'ÉTUDIANT'}</th>
              <th>Email</th>
              <th>Niveau</th>
              {activeTab === 'teachers' && <th>Classes</th>}
              {activeTab === 'teachers' && <th>Matières</th>}
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
                  <td className="text-muted">{user.niveau_nom || '-'}</td>
                  {activeTab === 'teachers' && <td className="text-muted">{(user.classe_noms || []).join(', ') || '-'}</td>}
                  {activeTab === 'teachers' && <td className="text-muted">{(user.matiere_noms || []).join(', ') || '-'}</td>}
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
        {activeTab === 'students' && (
          <Form.Group controlId="classeSelect" className="mb-4">
            <Form.Label className="form-label">Sélectionner une classe</Form.Label>
            <Form.Control
              as="select"
              value={selectedClasse}
              onChange={(e) => setSelectedClasse(e.target.value)}
              className="form-control"
            >
              <option value="">Toutes les classes</option>
              {classes.map((classe) => (
                <option key={classe.id} value={classe.id}>
                  {classe.nom}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
        )}
        {activeTab === 'teachers' && renderTable(teachers, 'Enseignants')}
        {activeTab === 'students' && renderTable(filteredStudents, 'Étudiants')}

        <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered size="lg">
          <Modal.Header closeButton className="bg-primary text-white">
            <Modal.Title className="fw-bold">Ajouter un nouvel {activeTab === 'teachers' ? 'enseignant' : 'étudiant'}</Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4">
            {error && <Alert variant="danger" className="mb-4">{error}</Alert>}
            <Form>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Group controlId="formUserPrenom" className="mb-3">
                    <Form.Label className="form-label">Prénom</Form.Label>
                    <Form.Control
                      type="text"
                      value={newUser.prenom}
                      onChange={(e) => setNewUser({ ...newUser, prenom: e.target.value })}
                      placeholder="Entrez le prénom"
                      className="form-control"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="formUserNom" className="mb-3">
                    <Form.Label className="form-label">Nom</Form.Label>
                    <Form.Control
                      type="text"
                      value={newUser.nom}
                      onChange={(e) => setNewUser({ ...newUser, nom: e.target.value })}
                      placeholder="Entrez le nom"
                      className="form-control"
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Group controlId="formUserEmail" className="mb-3">
                    <Form.Label className="form-label">Email</Form.Label>
                    <Form.Control
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      placeholder="Entrez l'email"
                      className="form-control"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="formUserPassword" className="mb-3">
                    <Form.Label className="form-label">Mot de passe</Form.Label>
                    <Form.Control
                      type="password"
                      value={newUser.mot_de_passe}
                      onChange={(e) => setNewUser({ ...newUser, mot_de_passe: e.target.value })}
                      placeholder="Entrez le mot de passe"
                      className="form-control"
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group controlId="formUserNiveau" className="mb-3">
                <Form.Label className="form-label">Niveau</Form.Label>
                <Form.Control
                  as="select"
                  value={newUser.niveau_id}
                  onChange={handleLevelChange}
                  className="form-control"
                  required
                >
                  <option value="">Sélectionner un niveau</option>
                  {levels.map(level => (
                    <option key={level.id} value={level.id}>{level.nom}</option>
                  ))}
                </Form.Control>
              </Form.Group>
              {activeTab === 'teachers' && newUser.niveau_id && classes.length > 0 && (
                <Form.Group controlId="formUserClasses" className="mb-3">
                  <Form.Label className="form-label">Classes associées</Form.Label>
                  <div className="class-selection-container">
                    {classes.map(classe => (
                      <Form.Check
                        key={classe.id}
                        type="checkbox"
                        id={`class-${classe.id}`}
                        label={classe.nom}
                        value={classe.id}
                        checked={newUser.classe_ids.includes(classe.id.toString())}
                        onChange={(e) => {
                          const updatedClasses = e.target.checked
                            ? [...newUser.classe_ids, e.target.value]
                            : newUser.classe_ids.filter(id => id !== e.target.value);
                          setNewUser({ ...newUser, classe_ids: updatedClasses });
                        }}
                        className="mb-2"
                      />
                    ))}
                  </div>
                  <Form.Text className="text-muted">
                    Cochez pour sélectionner plusieurs classes.
                  </Form.Text>
                </Form.Group>
              )}
              {activeTab === 'teachers' && newUser.niveau_id && filteredSubjects.length > 0 && (
                <Form.Group controlId="formUserMatieres" className="mb-3">
                  <Form.Label className="form-label">Matières associées</Form.Label>
                  <div className="class-selection-container">
                    {filteredSubjects.map(subject => (
                      <Form.Check
                        key={subject.id}
                        type="checkbox"
                        id={`matiere-${subject.id}`}
                        label={subject.nom}
                        value={subject.id}
                        checked={newUser.matiere_ids.includes(subject.id.toString())}
                        onChange={(e) => {
                          const updatedMatieres = e.target.checked
                            ? [...newUser.matiere_ids, e.target.value]
                            : newUser.matiere_ids.filter(id => id !== e.target.value);
                          setNewUser({ ...newUser, matiere_ids: updatedMatieres });
                        }}
                        className="mb-2"
                      />
                    ))}
                  </div>
                  <Form.Text className="text-muted">
                    Cochez pour sélectionner plusieurs matières.
                  </Form.Text>
                </Form.Group>
              )}
            </Form>
          </Modal.Body>
          <Modal.Footer className="bg-light py-3">
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Annuler
            </Button>
            <Button
              variant="primary"
              onClick={handleAddUser}
              disabled={
                !newUser.prenom ||
                !newUser.nom ||
                !newUser.email ||
                !newUser.mot_de_passe ||
                !newUser.niveau_id ||
                (activeTab === 'teachers' && (newUser.classe_ids.length === 0 || newUser.matiere_ids.length === 0))
              }
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

        <Modal show={showAddStudentToClassModal} onHide={() => setShowAddStudentToClassModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Ajouter un étudiant à la classe</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group controlId="studentSelect" className="mb-3">
                <Form.Label className="form-label w-50">Sélectionner un étudiant</Form.Label>
                <Form.Control
                  as="select"
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="form-control w-50"
                >
                  <option value="">Choisir un étudiant</option>
                  {allStudents
                    .filter((student) => !filteredStudents.some((s) => s.id === student.id))
                    .map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.prenom} {student.nom}
                      </option>
                    ))}
                </Form.Control>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddStudentToClassModal(false)}>
              Fermer
            </Button>
            <Button
              variant="primary"
              onClick={handleAddStudentToClasse}
              disabled={!selectedStudentId}
              className="custom-btn"
            >
              Ajouter
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
}

export default GestionUtilisateur;