import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Nav,
  Button,
  Form,
  Modal,
  Badge,
  ListGroup,
} from "react-bootstrap";
import {
  People,
  Book,
  Calendar,
  Gear,
  Search,
  Bell,
  MortarboardFill,
  Speedometer,
} from "react-bootstrap-icons";
import Students from "./Students";
import Teachers from "./Teachers";
import Courses from "./Courses";
import Schedule from "./Schedule";
import "./admin.css";
import profil from "../images/businessman-310819_1280.png";
import Background3D from "./Background3D";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const teacherData = [
  { name: "Prof. Sarah Miller", students: 156 },
  { name: "Dr. James Wilson", students: 142 },
  { name: "Prof. Emma Davis", students: 128 },
  { name: "Dr. Michael Brown", students: 115 },
  { name: "Prof. Lisa Anderson", students: 98 },
];

const AdminDashboard = () => {
  const [currentView, setCurrentView] = useState("dashboard");
  const [notifications, setNotifications] = useState([]);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);

  useEffect(() => {
    // Fetch notifications (backend already filters for pending users)
    axios
      .get("http://localhost:5000/api/notifications")
      .then((response) => {
        setNotifications(response.data);
      })
      .catch((error) => console.error("Erreur notifications :", error));
  }, []);

  const handleApprove = async (userId) => {
    try {
      await axios.post("http://localhost:5000/api/auth/approve", { userId });
      // Clear all notifications after approval
      setNotifications([]);
      alert("Utilisateur approuvé et email envoyé.");
    } catch (error) {
      console.error("Erreur approbation :", error);
      alert("Erreur lors de l'approbation.");
    }
  };

  const chartOptions = {
    indexAxis: "y",
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
          text: "Number of Students",
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
        borderColor: "#0d6efd",
        backgroundColor: "rgba(13, 110, 253, 0.5)",
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const views = {
    students: <Students />,
    courses: <Courses />,
    schedule: <Schedule />,
    teachers: <Teachers/>,
    dashboard: (
      <>
        <Row>
          {[
            { icon: People, label: "Total des étudiants", value: "1 234" },
            { icon: Book, label: "Cours actifs", value: "42" },
            { icon: Calendar, label: "Taux d'achèvement", value: "87%" },
            { icon: People, label: "Nouvelles inscriptions", value: "+28" },
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
        {/* Sidebar */}
        <Nav className="flex-column bg-light shadow-sm p-3 sidebar">
          <div className="d-flex align-items-center p-3">
            <MortarboardFill
              style={{ width: "32px", height: "32px" }}
              className="text-white me-2"
            />
            <span className="fw-bold fs-4 text-white">EduAdmin</span>
          </div>
          {[
            { icon: Speedometer, label: "Tableau de bord", view: "dashboard" },
            { icon: People, label: "Étudiants", view: "students" },
            { icon: People, label: "Enseignant", view: "teachers" },
            { icon: Book, label: "Cours", view: "courses" },
            { icon: Calendar, label: "Emploi du temps", view: "schedule" },
            { icon: Gear, label: "Paramètres", view: "settings" },
          ].map(({ icon: Icon, label, view }) => (
            <Button
              key={label}
              variant="light"
              onClick={() => setCurrentView(view)}
              className="d-flex align-items-center mb-2 text-start"
            >
              <Icon className="me-2" />
              {label}
            </Button>
          ))}
        </Nav>

        {/* Main Content */}
        <div className="main-content flex-grow-1 p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <Form className="d-flex">
              <Form.Control
                type="text"
                placeholder="Rechercher..."
                className="me-2"
              />
              <Button variant="outline-secondary">
                <Search />
              </Button>
            </Form>
            <div className="d-flex align-items-center">
              {/* Notification Icon with Badge */}
              <div
                className="position-relative me-4"
                style={{ cursor: "pointer" }}
                onClick={() => setShowNotificationsModal(true)}
              >
                <Bell size={24} />
                <Badge
                  bg={notifications.length > 0 ? "danger" : "secondary"}
                  className="position-absolute top-0 start-100 translate-middle"
                  pill
                >
                  {notifications.length}
                </Badge>
              </div>
              <img
                src={profil}
                alt="Profil"
                className="profile-img rounded-circle"
              />
            </div>
          </div>

          {views[currentView] || <div>View not found</div>}
        </div>
      </Container>

      {/* Notifications Modal */}
      <Modal
        show={showNotificationsModal}
        onHide={() => setShowNotificationsModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Notifications</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {notifications.length > 0 ? (
            <ListGroup>
              {notifications.map((notif) => (
                <ListGroup.Item
                  key={notif.id}
                  className="d-flex justify-content-between align-items-center"
                >
                  <div className="d-flex align-items-center">
                    <img
                      src={notif.Utilisateur?.photo || profil} // Use user's photo if available
                      alt="User"
                      className="rounded-circle me-2"
                      style={{ width: "40px", height: "40px" }}
                    />
                    <div>
                      <p className="mb-0">
                        Nouvelle inscription en attente: {notif.Utilisateur?.prenom} {notif.Utilisateur?.nom}
                      </p>
                      <small className="text-muted">
                        ({notif.Utilisateur?.email})
                      </small>
                    </div>
                  </div>
                  <Button
                    variant="primary"
                    onClick={() => handleApprove(notif.userId)}
                  >
                    Approuver
                  </Button>
                </ListGroup.Item>
              ))}
            </ListGroup>
          ) : (
            <p>Aucune notification</p>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default AdminDashboard;