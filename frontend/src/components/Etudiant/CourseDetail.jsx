import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
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
  FaShareAlt,
  FaStar,
  FaCcVisa,
  FaPaypal,
} from "react-icons/fa";
import StudentNavbar from "./StudentNavbar";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const CourseDetail = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("credit");
  const navigate = useNavigate();
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const token = localStorage.getItem('token'); 
        const response = await axios.get(
          `http://localhost:5000/api/cours/?${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("Course Data:", response.data);
        setCourse(response.data[0]);
        setLoading(false);
      } catch (err) {
        console.error("Fetch Error:", err);
        setError("Erreur lors de la récupération du cours");
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  const handleModalClose = () => setShowModal(false);
  const handleModalShow = () => setShowModal(true);

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>{error}</div>;
  if (!course) return <div>Cours non trouvé</div>;

  return (
    <div className="container mt-4">
      <StudentNavbar />
      <Card style={{ "margin-top": 100 }}>
        <Card.Img
          src={
            "https://cdn.builder.io/api/v1/image/assets/TEMP/5c6958e7f3998b6cd8a995e08375607330da0fa7?apiKey=94620a1500a3473894a74b620cac940d"
          }
          alt="Bannière du cours"
        />
      </Card>

      <div className="row m-4">
        <div className="col-md-8">
          <Card className="p-3">
            <h3>{course.titre || "Titre non disponible"}</h3>
            <p>{course.description || "Description non disponible"}</p>
            <div className="d-flex align-items-center">
              {[...Array(5)].map((_, i) => (
                <FaStar key={i} color={i < 4 ? "gold" : "gray"} />
              ))}
            </div>
            <p>Note maximale</p>
            <ListGroup variant="flush">
              {[5, 4, 3, 2, 1].map((star) => (
                <ListGroup.Item key={star}>
                  {`${star} étoiles`} <span className="bar"></span>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>
        </div>

        <div className="col-md-4">
          <Card className="text-center">
            <Card.Img
              variant="top"
              src={
                `http://localhost:5000/uploads/${course.image}` ||
                "https://cdn.builder.io/api/v1/image/assets/TEMP/a85e77bb033323a4f80aa22a5ddaa820f2f71367?apiKey=94620a1500a3473894a74b620cac940d"
              }
            />
            <Card.Body>
              <h4>
                {course.status === "Gratuit" ? (
                  <Badge bg="success">Gratuit</Badge>
                ) : (
                  <>
                    <Badge bg="success">
                      ${course.prix || "Prix non disponible"}
                    </Badge>
                    {course.status === "Payé" && <del>${course.prix * 2}</del>}
                  </>
                )}
              </h4>
              <p className="text-danger">Il reste 11 heures à ce prix</p>
              <Button
  variant="primary"
  className="w-100 mb-2"
  onClick={() => navigate(`/course/${id}/content`)}
>
  {course.status === "Gratuit"
    ? "Accéder au cours"
    : "Acheter maintenant"}
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
                      "Certification de fin de formation",
                      `${course.module || "Modules non disponibles"} modules`,
                    ]
                ).map((item, index) => (
                  <ListGroup.Item key={index}>
                    <FaCheckCircle className="me-2" /> {item}
                  </ListGroup.Item>
                ))}
              </ListGroup>
              <h5 className="mt-3">Partager ce cours</h5>
              <div className="d-flex justify-content-center">
                {["facebook", "twitter", "linkedin", "instagram"].map(
                  (network, index) => (
                    <Button key={index} variant="light" className="me-2">
                      <FaShareAlt />
                    </Button>
                  )
                )}
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>

      <Modal show={showModal} onHide={handleModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>Formulaire de paiement</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <h5>Choisissez votre mode de paiement</h5>
            <Row className="mb-3">
              <Col md={4}>
                <Button
                  variant={paymentMethod === "credit" ? "primary" : "light"}
                  onClick={() => setPaymentMethod("credit")}
                  className="w-100"
                >
                  <FaCcVisa className="me-2" /> Carte de Crédit
                </Button>
              </Col>
              <Col md={4}>
                <Button
                  variant={paymentMethod === "paypal" ? "primary" : "light"}
                  onClick={() => setPaymentMethod("paypal")}
                  className="w-100"
                >
                  <FaPaypal className="me-2" /> PayPal
                </Button>
              </Col>
            </Row>
            {paymentMethod === "credit" ? (
              <>
                <Form.Group controlId="formName">
                  <Form.Label>Nom complet</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Entrez votre nom complet"
                  />
                </Form.Group>
                <Form.Group controlId="formEmail">
                  <Form.Label>Email</Form.Label>
                  <Form.Control type="email" placeholder="Entrez votre email" />
                </Form.Group>
                <Form.Group controlId="formCreditCard">
                  <Form.Label>Numéro de carte de crédit</Form.Label>
                  <Form.Control type="text" placeholder="Numéro de carte" />
                </Form.Group>
                <Form.Group controlId="formExpiry">
                  <Form.Label>Date d'expiration</Form.Label>
                  <Form.Control type="text" placeholder="MM/AA" />
                </Form.Group>
                <Form.Group controlId="formCVC">
                  <Form.Label>CVC</Form.Label>
                  <Form.Control type="text" placeholder="CVC" />
                </Form.Group>
              </>
            ) : (
              <Form.Group controlId="formPaypalEmail">
                <Form.Label>Adresse email PayPal</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Entrez votre email PayPal"
                />
              </Form.Group>
            )}
            <Button variant="primary" type="submit" className="mt-3">
              Payer maintenant
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default CourseDetail;
