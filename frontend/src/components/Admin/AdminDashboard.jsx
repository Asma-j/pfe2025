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
import Courses from './Courses';
import Navbar from './AdminNavbar';
import Schedule from './Schedule';
import Sidebar from './Sidebar';
import GestionMatiere from './GestionMatiere';
import GestionNiveau from './GestionNiveau';
import GestionClasse from './GestionClasse';
import GestionUtilisateur from './GestionUtilisateur';
import AnalyticsChart from './AnalyticsChart';
import { getSessionId } from '../Auth/session';
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AdminDashboard = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [activeTab, setActiveTab] = useState('teachers');
  const [notifications, setNotifications] = useState([]);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [userPhoto, setUserPhoto] = useState(null);
  const sessionId = getSessionId();
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeCourses: 0,
    completionRate: '0%',
    newRegistrations: '+0',
    topTeachers: [],
  });

  useEffect(() => {

const token = localStorage.getItem(`token_${sessionId}`);
    if (!token) {
      window.location.href = '/';
      return;
    }

    // Récupérer les statistiques du tableau de bord
    const fetchStats = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/statistics/dashboard', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
      }
    };

    // Récupérer les notifications
    const fetchNotifications = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/notifications/inscription', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotifications(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des notifications:', error);
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
      }
    };

    // Récupérer le profil utilisateur
    const fetchProfile = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/users/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserPhoto(response.data.photo);
      } catch (error) {
        console.error('Erreur lors de la récupération du profil:', error);
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
      }
    };

    fetchStats();
    fetchNotifications();
    fetchProfile();
  }, []);

  const handleApprove = async (userId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:5000/api/auth/approve',
        { userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Récupérer à nouveau les notifications
      const updatedNotifications = await axios.get('http://localhost:5000/api/notifications/inscription', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(updatedNotifications.data);
      // Récupérer à nouveau les statistiques pour mettre à jour les nouvelles inscriptions
      const statsResponse = await axios.get('http://localhost:5000/api/statistics/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(statsResponse.data);
      alert(response.data.message);
    } catch (error) {
      console.error('Erreur lors de l\'approbation:', error);
      alert('Erreur lors de l\'approbation: ' + (error.response?.data?.error || error.message));
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
  };

  const chartOptions = {
    indexAxis: 'y',
    elements: { bar: { borderWidth: 2 } },
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: { callbacks: { label: (context) => `${context.raw} étudiants` } },
    },
    scales: {
      x: { 
        grid: { display: false }, 
        title: { display: true, text: 'Nombre d\'étudiants' }, 
        ticks: { maxRotation: 0 } 
      },
      y: { 
        grid: { display: false }, 
        ticks: { font: { size: 12 } } 
      },
    },
  };

  const chartData = {
    labels: stats.topTeachers.map((t) => t.name),
    datasets: [
      {
        data: stats.topTeachers.map((t) => t.students),
        borderColor: '#0d6efd',
        backgroundColor: 'rgba(13, 110, 253, 0.5)',
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const statsConfig = [
    {
      section: 'Statistiques',
      items: [
        {
          icon: People,
          label: 'Total des étudiants',
          value: stats.totalStudents,
          bgClass: 'bg-primary-light',
        },
        {
          icon: Book,
          label: 'Cours actifs',
          value: stats.activeCourses,
          bgClass: 'bg-info-light',
        },
        {
          icon: Calendar,
          label: 'Taux d\'achèvement',
          value: stats.completionRate,
          bgClass: 'bg-success-light',
        },
        {
          icon: People,
          label: 'Nouvelles inscriptions',
          value: stats.newRegistrations,
          bgClass: 'bg-warning-light',
        },
      ],
    },
  ];

  const views = {
    courses: <Courses />,
    schedule: <Schedule />,
    matiere: <GestionMatiere />,
    niveau: <GestionNiveau />,
    classe: <GestionClasse />,
    user: <GestionUtilisateur activeTab={activeTab} setActiveTab={setActiveTab} />,
    dashboard: (
      <>
        {statsConfig.map(({ section, items }) => (
          <div key={section} className="mb-4">
            <h3 className="mb-3">{section}</h3>
            <Row>
              {items.map(({ icon: Icon, label, value, bgClass }) => (
                <Col key={label} md={3} className="mb-3">
                  <Card className={`shadow-sm text-center p-3 ${bgClass}`}>
                    <Icon size={30} className="text-primary mb-2" />
                    <Card.Text className="text-muted mb-0">{label}</Card.Text>
                    <Card.Title className="mb-0">{value}</Card.Title>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        ))}
        <Row>
          <Card>
            <Card.Header>
              <div className="d-flex align-items-center gap-2">
                <People size={24} />
                <h4 className="mb-0">Meilleurs enseignants par nombre d'étudiants</h4>
              </div>
            </Card.Header>
            <Card.Body>
              <div className="chart-container" style={{ maxWidth: '100%', overflowX: 'hidden' }}>
                <Bar options={chartOptions} data={chartData} />
              </div>
            </Card.Body>
            <Card.Footer>
              <div className="d-flex align-items-center gap-2 footer-text">
                <People size={16} />
                <span>Nombre d'étudiants inscrits par enseignant</span>
              </div>
            </Card.Footer>
          </Card>
        </Row>
        <Row className="mt-4">
          <Col>
            <AnalyticsChart />
          </Col>
        </Row>
      </>
    ),
  };

  return (
    <div className="dashboard-container">
      <Container fluid className="min-vh-100 d-flex p-0">
        <Sidebar
          setCurrentView={setCurrentView}
          currentView={currentView}
          setActiveTab={setActiveTab}
        />
        <div className="main-content flex-grow-1 p-4" style={{ overflowX: 'hidden' }}>
          <Navbar
            notifications={notifications}
            setNotifications={setNotifications}
            showNotificationsModal={showNotificationsModal}
            setShowNotificationsModal={setShowNotificationsModal}
            handleApprove={handleApprove}
            userPhoto={userPhoto}
            setCurrentView={setCurrentView}
            setActiveTab={setActiveTab}
          />
          {views[currentView] || <div>Vue non trouvée</div>}
        </div>
      </Container>
    </div>
  );
};

export default AdminDashboard;