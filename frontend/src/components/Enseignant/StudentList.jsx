import React, { useState, useEffect } from 'react';
import { Form, Table, Button } from 'react-bootstrap';
import axios from 'axios';

const StudentList = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [students, setStudents] = useState([]);
  const [completedPlannings, setCompletedPlannings] = useState([]);
  const [selectedPlanning, setSelectedPlanning] = useState('');
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_URL = 'http://localhost:5000';

  // Fetch classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/api/classes`);
        setClasses(response.data);
        if (response.data.length > 0) {
          setSelectedClass(response.data[0].id);
        }
        setLoading(false);
      } catch (err) {
        setError('Erreur lors de la récupération des classes');
        setLoading(false);
      }
    };
    fetchClasses();
  }, []);

  // Fetch completed plannings
  useEffect(() => {
    if (!selectedClass) return;
    const fetchCompletedPlannings = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/api/plannings/completed/classe/${selectedClass}`);
        setCompletedPlannings(response.data);
        setSelectedPlanning(response.data.length > 0 ? response.data[0].id : '');
        setLoading(false);
      } catch (err) {
        setError('Erreur lors de la récupération des plannings terminés');
        setLoading(false);
      }
    };
    fetchCompletedPlannings();
  }, [selectedClass]);

  // Fetch students
  useEffect(() => {
    if (!selectedClass) return;
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/api/users/students/classe/${selectedClass}`);
        setStudents(response.data);
        setLoading(false);
      } catch (err) {
        setError('Erreur lors de la récupération des étudiants');
        setLoading(false);
      }
    };
    fetchStudents();
  }, [selectedClass]);

  // Fetch attendance
  useEffect(() => {
    if (!selectedPlanning) return;
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/api/presence/${selectedPlanning}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setAttendance(response.data);
        setLoading(false);
      } catch (err) {
        const errorMessage =
          err.response?.status === 401
            ? 'Session expirée, veuillez vous reconnecter'
            : err.response?.status === 403
            ? 'Accès non autorisé'
            : err.response?.status === 404
            ? 'Aucune présence enregistrée pour ce planning'
            : 'Erreur lors de la récupération de la présence';
        setError(errorMessage);
        setAttendance([]);
        setLoading(false);
      }
    };
    fetchAttendance();
  }, [selectedPlanning]);

  // Handle manual attendance marking
  const toggleAttendance = (studentId) => {
    setAttendance((prev) => {
      const existing = prev.find((a) => a.utilisateur_id === studentId);
      if (existing) {
        return prev.map((a) =>
          a.utilisateur_id === studentId ? { ...a, present: !a.present } : a
        );
      }
      return [
        ...prev,
        {
          utilisateur_id: studentId,
          present: true,
          Utilisateur: students.find((s) => s.id === studentId),
        },
      ];
    });
  };

  // Save attendance
  const saveAttendance = async () => {
    try {
      setLoading(true);
      await axios.post(
        `${API_URL}/api/presence`,
        {
          planningId: selectedPlanning,
          attendance: attendance.map((a) => ({
            utilisateur_id: a.utilisateur_id,
            present: a.present,
          })),
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setLoading(false);
      alert('Présence enregistrée avec succès');
    } catch (err) {
      const errorMessage =
        err.response?.status === 401
          ? 'Session expirée, veuillez vous reconnecter'
          : err.response?.status === 403
          ? 'Accès non autorisé'
          : 'Erreur lors de l\'enregistrement de la présence';
      setError(errorMessage);
      setLoading(false);
    }
  };

  // Send quiz notifications
  const sendQuizNotifications = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${API_URL}/api/presence/notify-quiz`,
        { planningId: selectedPlanning },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setLoading(false);
      alert(response.data.message);
    } catch (err) {
      const errorMessage =
        err.response?.status === 401
          ? 'Session expirée, veuillez vous reconnecter'
          : err.response?.status === 403
          ? 'Accès non autorisé'
          : err.response?.status === 404
          ? err.response.data.message
          : 'Erreur lors de l\'envoi des notifications';
      setError(errorMessage);
      setLoading(false);
    }
  };

  // Check if student was present
  const wasStudentPresent = (studentId) => {
    const record = attendance.find((a) => a.utilisateur_id === studentId);
    return record ? record.present : false;
  };

  // Check if there are present students
  const hasPresentStudents = attendance.some((a) => a.present);

  return (
    <div className="card p-3">
      <h5>Liste des étudiants</h5>
      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <div>Chargement...</div>}
      <Form.Group className="mb-3">
        <Form.Label>Sélectionner une classe</Form.Label>
        <Form.Select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          disabled={loading || classes.length === 0}
        >
          {classes.length === 0 ? (
            <option>Aucune classe disponible</option>
          ) : (
            classes.map((classe) => (
              <option key={classe.id} value={classe.id}>
                {classe.nom}
              </option>
            ))
          )}
        </Form.Select>
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Sélectionner une réunion terminée</Form.Label>
        <Form.Select
          value={selectedPlanning}
          onChange={(e) => setSelectedPlanning(e.target.value)}
          disabled={loading || completedPlannings.length === 0}
        >
          {completedPlannings.length === 0 ? (
            <option>Aucune réunion terminée</option>
          ) : (
            completedPlannings.map((planning) => (
              <option key={planning.id} value={planning.id}>
                {planning.titre} ({new Date(planning.date_debut).toLocaleDateString()})
              </option>
            ))
          )}
        </Form.Select>
      </Form.Group>
      <div className="mb-3">
        <Button
          variant="primary"
          onClick={saveAttendance}
          disabled={loading || !selectedPlanning || attendance.length === 0}
          className="me-2"
        >
          Enregistrer la présence
        </Button>
        <Button
          variant="success"
          onClick={sendQuizNotifications}
          disabled={loading || !selectedPlanning || !hasPresentStudents}
        >
          Envoyer notifications pour évaluation
        </Button>
      </div>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Prénom</th>
            <th>Nom</th>
            <th>Email</th>
            <th>Présence</th>
          </tr>
        </thead>
        <tbody>
          {students.length === 0 && !loading ? (
            <tr>
              <td colSpan="5" className="text-center">
                Aucun étudiant trouvé pour cette classe
              </td>
            </tr>
          ) : (
            students.map((student) => (
              <tr key={student.id}>
                <td>{student.id}</td>
                <td>{student.prenom}</td>
                <td>{student.nom}</td>
                <td>{student.email}</td>
                <td>
                  <Form.Check
                    type="checkbox"
                    checked={wasStudentPresent(student.id)}
                    onChange={() => toggleAttendance(student.id)}
                    disabled={!selectedPlanning}
                  />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default StudentList;