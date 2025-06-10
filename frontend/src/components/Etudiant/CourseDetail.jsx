import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Button,
  ListGroup,
  Badge,
  Modal,
  Form,
  Row,
  Col,
} from "react-bootstrap";
import {
  FaCheckCircle,
  FaStar,
  FaCcVisa,
  FaPaypal,
} from "react-icons/fa";
import StudentNavbar from "./StudentNavbar";
import axios from "axios";
import Footer from "./Footer";
import { jwtDecode } from "jwt-decode";
import "./content.css";

const CourseDetail = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("credit");
  const [hasPaid, setHasPaid] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourseAndPaymentStatus = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Utilisateur non authentifié. Veuillez vous connecter.");
        }

        const decodedToken = jwtDecode(token);
        const userId = decodedToken.id;
        if (!userId) {
          throw new Error("Utilisateur non authentifié. Veuillez vous connecter.");
        }

        const courseResponse = await axios.get(`http://localhost:5000/api/cours/${id}`, {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Course Data:", courseResponse.data);

        if (!courseResponse.data) {
          throw new Error("No course data returned from API");
        }

        setCourse(courseResponse.data);

        if (courseResponse.data.status === "Gratuit") {
          setHasPaid(true);
        } else if (courseResponse.data.status === "Payé") {
          const paymentResponse = await axios.get(`http://localhost:5000/api/paiements/check-status`, {
            withCredentials: true,
            params: { utilisateur_id: userId, cours_id: id },
            headers: { Authorization: `Bearer ${token}` },
          });
          setHasPaid(paymentResponse.data.hasPaid);
        } else {
          setHasPaid(false);
        }

        setLoading(false);
      } catch (err) {
        console.error("Fetch Error:", err);
        setError(err.response?.data?.message || "Erreur lors de la récupération du cours ou du statut de paiement.");
        setLoading(false);
      }
    };
    fetchCourseAndPaymentStatus();
  }, [id, navigate]);

  const handleModalClose = () => setShowModal(false);
  const handleModalShow = () => setShowModal(true);

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Utilisateur non authentifié. Veuillez vous connecter.");
      }

      const decodedToken = jwtDecode(token);
      const userId = decodedToken.id;
      if (!userId) {
        throw new Error("Utilisateur non authentifié. Veuillez vous connecter.");
      }

      const paymentData = {
        montant: course.prix,
        methode_paiement: paymentMethod === "credit" ? "Carte" : "Paypal",
        utilisateur_id: userId,
        cours_id: id,
      };

      const response = await axios.post(`http://localhost:5000/api/paiements`, paymentData, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 201) {
        setHasPaid(true);
        setShowModal(false);
        alert("Paiement réussi ! Vous pouvez maintenant accéder au cours.");
      }
    } catch (err) {
      console.error("Payment Error:", err);
      alert(err.response?.data?.message || "Erreur lors du paiement. Veuillez réessayer.");
    }
  };

  if (loading) return <div className="text-center mt-5">Chargement...</div>;
  if (error) return <div className="text-center mt-5 text-danger">{error}</div>;
  if (!course) return <div className="text-center mt-5">Cours non trouvé</div>;

  return (
    <div>
      <div className="container mt-4">
        <StudentNavbar />
        <Card style={{ marginTop: '100px' }}>
          <Card.Img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/5c6958e7f3998b6cd8a995e08375607330da0fa7?apiKey=94620a1500a3473894a74b620cac940d"
            alt="Bannière du cours"
          />
        </Card>

        <div className="row m-4">
          <div className="col-md-8">
            <Card className="p-3">
              <h3>{course.titre || "Titre non disponible"}</h3>
              <p>{course.description || "Description non disponible"}</p>
        
            
            </Card>
          </div>

          <div className="col-md-4">
            <Card className="text-center">
              <Card.Img
                variant="top"
                src={
                  course.image
                    ? `http://localhost:5000/Uploads/${course.image}`
                    : "https://cdn.builder.io/api/v1/image/assets/TEMP/a85e77bb033323a4f80aa22a5ddaa820f2f71367?apiKey=94620a1500a3473894a74b620cac940d"
                }
              />
              <Card.Body>
                <h4>
                  {course.status === "Gratuit" ? (
                    <Badge bg="success">Gratuit</Badge>
                  ) : (
                    <>
                      <Badge bg="success">${course.prix || "Prix non disponible"}</Badge>
                      {course.status === "Payé" && <del>${course.prix * 2}</del>}
                    </>
                  )}
                </h4>

                <Button
                  variant="primary"
                  className="w-100 mb-2"
                  onClick={() => {
                    if (course.status === "Gratuit" || hasPaid) {
                      navigate(`/course/${id}/content`);
                    } else {
                      handleModalShow();
                    }
                  }}
                >
                  {course.status === "Gratuit" || hasPaid ? "Accéder au cours" : "Acheter maintenant"}
                </Button>

                <h5>Ce cours inclut :</h5>
                <ListGroup variant="flush">
                  {(course.status === "Gratuit"
                    ? [
                        "Accès sur tous les appareils",
                        `${course.module || "Modules non disponibles"} modules`,
                      ]
                    : [
                        "Garantie de remboursement",
                        "Accès sur tous les appareils",
                        `${course.module || "Modules non disponibles"} modules`,
                      ]
                  ).map((item, index) => (
                    <ListGroup.Item key={index}>
                      <FaCheckCircle className="me-2" /> {item}
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Card.Body>
            </Card>
          </div>
        </div>

        <Modal show={showModal} onHide={handleModalClose} centered>
          <Modal.Header closeButton className="text-white">
            <Modal.Title>Formulaire de paiement</Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4">
            <Form onSubmit={handlePaymentSubmit} className="payment-form">
              <h5 className="mb-4 text-center">Choisissez votre mode de paiement</h5>
              <Row className="mb-4 text-center">
                <Col>
                  <Button
                    variant={paymentMethod === "credit" ? "primary" : "outline-secondary"}
                    onClick={() => setPaymentMethod("credit")}
                    className="w-100 py-2"
                  >
                    <FaCcVisa className="me-2" /> Carte de Crédit
                  </Button>
                </Col>
                <Col>
                  <Button
                    variant={paymentMethod === "paypal" ? "primary" : "outline-secondary"}
                    onClick={() => setPaymentMethod("paypal")}
                    className="w-100 py-2"
                  >
                    <FaPaypal className="me-2" /> PayPal
                  </Button>
                </Col>
              </Row>

              {paymentMethod === "credit" && (
                <>
                  <Form.Group className="mb-3">
                    <Form.Label>Nom complet</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Entrez votre nom complet"
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Entrez votre email"
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Numéro de carte</Form.Label>
                    <Form.Control type="text" placeholder="1234 5678 9012 3456" required />
                  </Form.Group>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Expiration</Form.Label>
                        <Form.Control type="text" placeholder="MM/AA" required />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>CVC</Form.Label>
                        <Form.Control type="text" placeholder="123" required />
                      </Form.Group>
                    </Col>
                  </Row>
                </>
              )}

              <Button variant="success" type="submit" className="w-100 mt-3">
                Payer maintenant
              </Button>
            </Form>
          </Modal.Body>
        </Modal>
      </div>
      <Footer />
    </div>
  );
};

export default CourseDetail;