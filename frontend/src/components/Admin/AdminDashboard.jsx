import axios from 'axios';
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from 'chart.js';
import React, { useEffect, useState } from 'react';
import { Card, Col, Container, Row } from 'react-bootstrap';
import { Book, Calendar, People } from 'react-bootstrap-icons';
import { Bar } from 'react-chartjs-2';
import './admin.css';
import Background3D from './Background3D';
import Courses from './Courses';
import Navbar from './AdminNavbar';
import Schedule from './Schedule';
import Sidebar from './Sidebar';
import Students from './Students';
import Teachers from './Teachers';
import GestionMatiere from './GestionMatiere';
import GestionMNiveau from './GestionNiveau';
import GestionMClasse from './GestionClasse';
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const teacherData = [
  { name: 'Prof. Sarah Miller', students: 156 },
  { name: 'Dr. James Wilson', students: 142 },
  { name: 'Prof. Emma Davis', students: 128 },
  { name: 'Dr. Michael Brown', students: 115 },
  { name: 'Prof. Lisa Anderson', students: 98 },
];

const AdminDashboard = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [notifications, setNotifications] = useState([]);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [userPhoto, setUserPhoto] = useState(null);

  useEffect(() => {
    // Fetch notifications
    axios
      .get('http://localhost:5000/api/notifications')
      .then((response) => {
        setNotifications(response.data);
      })
      .catch((error) => console.error('Erreur notifications :', error));

    // Fetch user profile
    axios
      .get('http://localhost:5000/api/users/profile', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
      .then((response) => {
        setUserPhoto(response.data.photo);
      })
      .catch((error) => console.error('Erreur profil :', error));
  }, []);

  const handleApprove = async (userId) => {
    try {
      await axios.post('http://localhost:5000/api/auth/approve', { userId });
      setNotifications([]);
      alert('Utilisateur approuvé et email envoyé.');
    } catch (error) {
      console.error('Erreur approbation :', error);
      alert("Erreur lors de l'approbation.");
    }
  };

  const chartOptions = {
    indexAxis: 'y',
    elements: {
      bar: {
        borderWidth: 2,
      },
    },
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.raw} students`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        title: {
          display: true,
          text: 'Number of Students',
        },
      },
      y: {
        grid: {
          display: false,
        },
      },
    },
  };

  const chartData = {
    labels: teacherData.map((t) => t.name),
    datasets: [
      {
        data: teacherData.map((t) => t.students),
        borderColor: '#0d6efd',
        backgroundColor: 'rgba(13, 110, 253, 0.5)',
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const views = {
    students: <Students />,
    courses: <Courses />,
    schedule: <Schedule />,
    teachers: <Teachers />,
    matiere: <GestionMatiere />, 
    niveau: <GestionMNiveau />,
     classe: <GestionMClasse />,
    dashboard: (
      <>
        <Row>
          {[
            { icon: People, label: 'Total des étudiants', value: '1 234' },
            { icon: Book, label: 'Cours actifs', value: '42' },
            { icon: Calendar, label: "Taux d'achèvement", value: '87%' },
            { icon: People, label: 'Nouvelles inscriptions', value: '+28' },
          ].map(({ icon: Icon, label, value }) => (
            <Col key={label} md={3}>
              <Card className="mb-4 shadow-sm text-center p-3 card-custom">
                <Icon size={30} className="text-primary" />
                <Card.Text className="text-muted mb-0 mt-2">{label}</Card.Text>
                <Card.Title className="mb-0">{value}</Card.Title>
              </Card>
            </Col>
          ))}
        </Row>
        <Row>
          <Card>
            <Card.Header>
              <div className="d-flex align-items-center gap-2">
                <People size={24} />
                <h4 className="mb-0">Top Teachers by Student Count</h4>
              </div>
            </Card.Header>
            <Card.Body>
              <div className="chart-container">
                <Bar options={chartOptions} data={chartData} />
              </div>
            </Card.Body>
            <Card.Footer>
              <div className="d-flex align-items-center gap-2 footer-text">
                <People size={16} />
                <span>Number of enrolled students per teacher</span>
              </div>
            </Card.Footer>
          </Card>
        </Row>
      </>
    ),
  };

  return (
    <div className="dashboard-container">
      <Background3D />
      <Container fluid className="min-vh-100 d-flex p-0">
        <Sidebar setCurrentView={setCurrentView} currentView={currentView} />
        <div className="main-content flex-grow-1 p-4">
          <Navbar
            notifications={notifications}
            showNotificationsModal={showNotificationsModal}
            setShowNotificationsModal={setShowNotificationsModal}
            handleApprove={handleApprove}
            userPhoto={userPhoto}
            setCurrentView={setCurrentView}
          />
          {views[currentView] || <div>View not found</div>}
        </div>
      </Container>
    </div>
  );
};

export default AdminDashboard;