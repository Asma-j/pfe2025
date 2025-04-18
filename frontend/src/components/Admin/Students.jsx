import React, { useEffect, useState } from 'react';
import { FaPlus, FaTrash, FaEdit } from 'react-icons/fa';
import { Button, Table, ProgressBar, Modal, Form, OverlayTrigger, Tooltip } from 'react-bootstrap';
import axios from 'axios';
import profil from "../images/businessman-310819_1280.png";
import './user.css'; // Import the custom CSS

function Students() {
  const [students, setStudents] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [niveaux, setNiveaux] = useState([]);
  const [selectedClasse, setSelectedClasse] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddClasseModal, setShowAddClasseModal] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showAddNewStudentModal, setShowAddNewStudentModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showAddNiveauModal, setShowAddNiveauModal] = useState(false);
  const [showUpdateNiveauModal, setShowUpdateNiveauModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedNiveau, setSelectedNiveau] = useState(null);
  const [status, setStatus] = useState('');
  const [newClasse, setNewClasse] = useState({ nom: '', niveau_id: '' });
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [newStudent, setNewStudent] = useState({
    prenom: '',
    nom: '',
    email: '',
    mot_de_passe: '',
    id_role: 2,
  });
  const [newNiveau, setNewNiveau] = useState({ nom: '', description: '' });

  useEffect(() => {
    Promise.all([
      axios.get('http://localhost:5000/api/users/students'),
      axios.get('http://localhost:5000/api/classes'),
      axios.get('http://localhost:5000/api/niveaux'),
    ])
      .then(([studentsResponse, classesResponse, niveauxResponse]) => {
        setAllStudents(studentsResponse.data);
        setStudents(studentsResponse.data);
        setClasses(classesResponse.data);
        setNiveaux(niveauxResponse.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (selectedClasse) {
      setLoading(true);
      axios
        .get(`http://localhost:5000/api/users/students/classe/${selectedClasse}`)
        .then((response) => {
          setStudents(response.data);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching students by classe:', error);
          setLoading(false);
        });
    } else {
      setStudents(allStudents);
      setLoading(false);
    }
  }, [selectedClasse, allStudents]);

  const handleAddClasse = () => {
    axios
      .post('http://localhost:5000/api/classes', newClasse)
      .then((response) => {
        setClasses([...classes, response.data.classe]);
        setShowAddClasseModal(false);
        setNewClasse({ nom: '', niveau_id: '' });
      })
      .catch((error) => {
        console.error('Error adding classe:', error);
      });
  };

  const handleAddNewStudent = () => {
    axios
      .post('http://localhost:5000/api/users', newStudent)
      .then((response) => {
        const newStudentData = response.data.data;
        setAllStudents([...allStudents, newStudentData]);
        setStudents([...students, newStudentData]);
        setShowAddNewStudentModal(false);
        setNewStudent({ prenom: '', nom: '', email: '', mot_de_passe: '', id_role: 2 });
      })
      .catch((error) => {
        console.error('Error adding student:', error);
      });
  };

  const handleUpdate = (id) => {
    axios
      .put(`http://localhost:5000/api/users/${id}`, { status })
      .then((response) => {
        console.log('User updated:', response.data);
        setStudents((prev) =>
          prev.map((user) =>
            user.id === id ? { ...user, status } : user
          )
        );
        setAllStudents((prev) =>
          prev.map((user) =>
            user.id === id ? { ...user, status } : user
          )
        );
        setShowUpdateModal(false);
      })
      .catch((error) => {
        console.error('Error updating user:', error);
      });
  };

  const handleDelete = (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet étudiant?')) {
      axios
        .delete(`http://localhost:5000/api/users/${id}`)
        .then((response) => {
          console.log('User deleted:', response.data);
          setStudents((prev) => prev.filter((user) => user.id !== id));
          setAllStudents((prev) => prev.filter((user) => user.id !== id));
        })
        .catch((error) => {
          console.error('Error deleting user:', error);
        });
    }
  };

  const handleAddStudentToClasse = () => {
    axios
      .post('http://localhost:5000/api/users/students/classe', {
        utilisateur_id: selectedStudentId,
        classe_id: selectedClasse,
      })
      .then((response) => {
        console.log('Student added to classe:', response.data);
        axios
          .get(`http://localhost:5000/api/users/students/classe/${selectedClasse}`)
          .then((response) => {
            setStudents(response.data);
            setShowAddStudentModal(false);
            setSelectedStudentId('');
          });
      })
      .catch((error) => {
        console.error('Error adding student to classe:', error);
      });
  };

  const handleAddNiveau = () => {
    axios
      .post('http://localhost:5000/api/niveaux', newNiveau)
      .then((response) => {
        setNiveaux([...niveaux, response.data.niveau]);
        setShowAddNiveauModal(false);
        setNewNiveau({ nom: '', description: '' });
      })
      .catch((error) => {
        console.error('Error adding niveau:', error);
      });
  };

  const handleUpdateNiveau = () => {
    if (!selectedNiveau) return;
    axios
      .put(`http://localhost:5000/api/niveaux/${selectedNiveau.id}`, newNiveau)
      .then((response) => {
        setNiveaux((prev) =>
          prev.map((niveau) =>
            niveau.id === selectedNiveau.id ? response.data.niveau : niveau
          )
        );
        setShowUpdateNiveauModal(false);
        setNewNiveau({ nom: '', description: '' });
        setSelectedNiveau(null);
      })
      .catch((error) => {
        console.error('Error updating niveau:', error);
      });
  };

  const handleDeleteNiveau = (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce niveau?')) {
      axios
        .delete(`http://localhost:5000/api/niveaux/${id}`)
        .then((response) => {
          console.log('Niveau deleted:', response.data);
          setNiveaux((prev) => prev.filter((niveau) => niveau.id !== id));
        })
        .catch((error) => {
          console.error('Error deleting niveau:', error);
        });
    }
  };

  const renderTable = (users, title) => (
    <div className="mb-5">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="section-title">{title}</h4>
        <div>
          <Button
            className="custom-btn me-2"
            variant="primary"
            onClick={() => setShowAddNewStudentModal(true)}
          >
            <FaPlus className="me-2" /> Ajouter un nouvel étudiant
          </Button>
          <Button
            className="custom-btn"
            variant="primary"
            onClick={() => setShowAddStudentModal(true)}
            disabled={!selectedClasse}
          >
            <FaPlus className="me-2" /> Ajouter un étudiant à la classe
          </Button>
        </div>
      </div>
      <Table className="custom-table">
        <thead>
          <tr>
            <th>ÉTUDIANT</th>
            <th>Email</th>
            <th>COURS</th>
            <th>PROGRÈS</th>
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
                <td>{user.courses ? user.courses.length : 0}</td>
                <td>
                  <div className="progress-bar-container">
                    <ProgressBar
                      now={user.progress || 0}
                      variant="primary"
                      style={{ height: '6px', width: '100px' }}
                    />
                    <span className="text-muted">{user.progress || 0}%</span>
                  </div>
                </td>
                <td className="text-muted">{user.status}</td>
                <td className="text-end">
                  <OverlayTrigger
                    placement="top"
                    overlay={<Tooltip>Modifier le statut</Tooltip>}
                  >
                    <Button
                      variant="link"
                      className="text-muted action-btn"
                      onClick={() => {
                        setSelectedUser(user);
                        setStatus(user.status);
                        setShowUpdateModal(true);
                      }}
                    >
                      <FaEdit />
                    </Button>
                  </OverlayTrigger>
                  <OverlayTrigger
                    placement="top"
                    overlay={<Tooltip>Supprimer l'étudiant</Tooltip>}
                  >
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
              <td colSpan="6" className="text-center text-muted">
                Aucun étudiant
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );

  const renderNiveauxTable = () => (
    <div className="mb-5">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="section-title">Gestion des Niveaux</h4>
        <Button
          className="custom-btn"
          variant="primary"
          onClick={() => setShowAddNiveauModal(true)}
        >
          <FaPlus className="me-2" /> Ajouter un niveau
        </Button>
      </div>
      <Table className="custom-table">
        <thead>
          <tr>
            <th>NOM</th>
            <th>DESCRIPTION</th>
            <th className="text-end">ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {niveaux.length > 0 ? (
            niveaux.map((niveau) => (
              <tr key={niveau.id}>
                <td>{niveau.nom}</td>
                <td>{niveau.description || 'Aucune description'}</td>
                <td className="text-end">
                  <OverlayTrigger
                    placement="top"
                    overlay={<Tooltip>Modifier le niveau</Tooltip>}
                  >
                    <Button
                      variant="link"
                      className="text-muted action-btn"
                      onClick={() => {
                        setSelectedNiveau(niveau);
                        setNewNiveau({ nom: niveau.nom, description: niveau.description || '' });
                        setShowUpdateNiveauModal(true);
                      }}
                    >
                      <FaEdit />
                    </Button>
                  </OverlayTrigger>
                  <OverlayTrigger
                    placement="top"
                    overlay={<Tooltip>Supprimer le niveau</Tooltip>}
                  >
                    <Button
                      variant="link"
                      className="text-muted action-btn"
                      onClick={() => handleDeleteNiveau(niveau.id)}
                    >
                      <FaTrash />
                    </Button>
                  </OverlayTrigger>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="text-center text-muted">
                Aucun niveau
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );

  const selectedNiveauForClasse = niveaux.find((niveau) => niveau.id === parseInt(newClasse.niveau_id));
  const niveauDescription = selectedNiveauForClasse ? selectedNiveauForClasse.description : '';

  if (loading) {
    return (
      <div className="text-center my-5">
        <h5 className="text-muted">Chargement...</h5>
      </div>
    );
  }

  return (
    <div className="students-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="section-title">Gestion des Classes et Étudiants</h4>
        <Button
          className="custom-btn"
          variant="primary"
          onClick={() => setShowAddClasseModal(true)}
        >
          <FaPlus className="me-2" /> Ajouter une classe
        </Button>
      </div>

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

      {renderTable(students, 'Étudiants')}

      {renderNiveauxTable()}

      {/* Modal pour ajouter une classe */}
      <Modal show={showAddClasseModal} onHide={() => setShowAddClasseModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Ajouter une classe</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formClasseNom" className="mb-3">
              <Form.Label className="form-label">Nom de la classe</Form.Label>
              <Form.Control
                type="text"
                value={newClasse.nom}
                onChange={(e) => setNewClasse({ ...newClasse, nom: e.target.value })}
                placeholder="Entrez le nom de la classe"
                className="form-control w-50"
              />
            </Form.Group>
            <Form.Group controlId="formClasseNiveau" className="mb-3">
              <Form.Label className="form-label">Niveau</Form.Label>
              <Form.Control
                as="select"
                value={newClasse.niveau_id}
                onChange={(e) => setNewClasse({ ...newClasse, niveau_id: e.target.value })}
                className="form-control w-50"
              >
                <option value="">Choisir un niveau</option>
                {niveaux.map((niveau) => (
                  <option key={niveau.id} value={niveau.id}>
                    {niveau.nom}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
            {selectedNiveauForClasse && (
              <Form.Group controlId="formNiveauDescription" className="mb-3">
                <Form.Label className="form-label">Description du niveau</Form.Label>
                <Form.Control
                  as="textarea"
                  value={niveauDescription}
                  readOnly
                  rows={3}
                  className="form-control w-50"
                />
              </Form.Group>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddClasseModal(false)}>
            Fermer
          </Button>
          <Button
            variant="primary"
            onClick={handleAddClasse}
            disabled={!newClasse.nom || !newClasse.niveau_id}
            className="custom-btn"
          >
            Ajouter
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal pour ajouter un étudiant manuellement */}
      <Modal show={showAddNewStudentModal} onHide={() => setShowAddNewStudentModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Ajouter un nouvel étudiant</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formStudentPrenom" className="mb-3">
              <Form.Label className="form-label">Prénom</Form.Label>
              <Form.Control
                type="text"
                value={newStudent.prenom}
                onChange={(e) => setNewStudent({ ...newStudent, prenom: e.target.value })}
                placeholder="Entrez le prénom"
                className="form-control w-50"
              />
            </Form.Group>
            <Form.Group controlId="formStudentNom" className="mb-3">
              <Form.Label className="form-label">Nom</Form.Label>
              <Form.Control
                type="text"
                value={newStudent.nom}
                onChange={(e) => setNewStudent({ ...newStudent, nom: e.target.value })}
                placeholder="Entrez le nom"
                className="form-control w-50"
              />
            </Form.Group>
            <Form.Group controlId="formStudentEmail" className="mb-3">
              <Form.Label className="form-label">Email</Form.Label>
              <Form.Control
                type="email"
                value={newStudent.email}
                onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                placeholder="Entrez l'email"
                className="form-control w-50"
              />
            </Form.Group>
            <Form.Group controlId="formStudentPassword" className="mb-3">
              <Form.Label className="form-label">Mot de passe</Form.Label>
              <Form.Control
                type="password"
                value={newStudent.mot_de_passe}
                onChange={(e) => setNewStudent({ ...newStudent, mot_de_passe: e.target.value })}
                placeholder="Entrez le mot de passe"
                className="form-control w-50"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddNewStudentModal(false)}>
            Fermer
          </Button>
          <Button
            variant="primary"
            onClick={handleAddNewStudent}
            disabled={!newStudent.prenom || !newStudent.nom || !newStudent.email || !newStudent.mot_de_passe}
            className="custom-btn"
          >
            Ajouter
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal pour ajouter un étudiant à une classe */}
      <Modal show={showAddStudentModal} onHide={() => setShowAddStudentModal(false)} centered>
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
                  .filter((student) => !students.some((s) => s.id === student.id))
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
          <Button variant="secondary" onClick={() => setShowAddStudentModal(false)}>
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

      {/* Modal pour mise à jour du statut */}
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
            onClick={() => {
              if (selectedUser) {
                handleUpdate(selectedUser.id);
              }
            }}
            className="custom-btn"
          >
            Sauvegarder
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal pour ajouter un niveau */}
      <Modal show={showAddNiveauModal} onHide={() => setShowAddNiveauModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Ajouter un niveau</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formNiveauNom" className="mb-3">
              <Form.Label className="form-label">Nom du niveau</Form.Label>
              <Form.Control
                type="text"
                value={newNiveau.nom}
                onChange={(e) => setNewNiveau({ ...newNiveau, nom: e.target.value })}
                placeholder="Entrez le nom du niveau"
                className="form-control w-50"
              />
            </Form.Group>
            <Form.Group controlId="formNiveauDescription" className="mb-3">
              <Form.Label className="form-label">Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={newNiveau.description}
                onChange={(e) => setNewNiveau({ ...newNiveau, description: e.target.value })}
                placeholder="Entrez une description (optionnel)"
                className="form-control w-50"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddNiveauModal(false)}>
            Fermer
          </Button>
          <Button
            variant="primary"
            onClick={handleAddNiveau}
            disabled={!newNiveau.nom}
            className="custom-btn"
          >
            Ajouter
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal pour modifier un niveau */}
      <Modal show={showUpdateNiveauModal} onHide={() => setShowUpdateNiveauModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Modifier un niveau</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formNiveauNom" className="mb-3">
              <Form.Label className="form-label">Nom du niveau</Form.Label>
              <Form.Control
                type="text"
                value={newNiveau.nom}
                onChange={(e) => setNewNiveau({ ...newNiveau, nom: e.target.value })}
                placeholder="Entrez le nom du niveau"
                className="form-control w-50"
              />
            </Form.Group>
            <Form.Group controlId="formNiveauDescription" className="mb-3">
              <Form.Label className="form-label">Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={newNiveau.description}
                onChange={(e) => setNewNiveau({ ...newNiveau, description: e.target.value })}
                placeholder="Entrez une description (optionnel)"
                className="form-control w-50"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUpdateNiveauModal(false)}>
            Fermer
          </Button>
          <Button
            variant="primary"
            onClick={handleUpdateNiveau}
            disabled={!newNiveau.nom}
            className="custom-btn"
          >
            Sauvegarder
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Students;