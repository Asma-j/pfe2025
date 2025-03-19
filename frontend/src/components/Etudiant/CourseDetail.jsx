import React, { useState } from "react";
import { Card, Button, ListGroup, Badge, Modal, Form, Row, Col } from "react-bootstrap";
import { FaCheckCircle, FaShareAlt, FaStar, FaCcVisa, FaPaypal } from "react-icons/fa";
import StudentNavbar from "./StudentNavbar";
import Footer from "./Footer";

const CourseDetail = () => {
  const [activeTab, setActiveTab] = useState("Overview");
  const [showModal, setShowModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("credit");

  const handleModalClose = () => setShowModal(false);
  const handleModalShow = () => setShowModal(true);

  return (
    <div className="container mt-4">
      <StudentNavbar />
      {/* Bannière */}
      <Card style={{ "margin-top": 100 }}>
        <Card.Img
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/5c6958e7f3998b6cd8a995e08375607330da0fa7?apiKey=94620a1500a3473894a74b620cac940d"
          alt="Bannière du cours"
        />
      </Card>

      {/* Détails du Cours */}
      <div className="row m-4">
        <div className="col-md-8">
          <Card className="p-3">
            <h3>4 sur 5</h3>
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
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/a85e77bb033323a4f80aa22a5ddaa820f2f71367?apiKey=94620a1500a3473894a74b620cac940d"
            />
            <Card.Body>
              <h4>
                <Badge bg="success">$49.65</Badge> <del>$99.99</del>
              </h4>
              <p className="text-danger">Il reste 11 heures à ce prix</p>
              <Button variant="primary" className="w-100 mb-2" onClick={handleModalShow}>
                Acheter maintenant
              </Button>
              <h5>Ce cours inclut :</h5>
              <ListGroup variant="flush">
                {[
                  "Garantie de remboursement",
                  "Accès sur tous les appareils",
                  "Certification de fin de formation",
                  "32 modules",
                ].map((item, index) => (
                  <ListGroup.Item key={index}>
                    <FaCheckCircle className="me-2" /> {item}
                  </ListGroup.Item>
                ))}
              </ListGroup>
              <h5 className="mt-3">Partager ce cours</h5>
              <div className="d-flex justify-content-center">
                {["facebook", "twitter", "linkedin", "instagram"].map((network, index) => (
                  <Button key={index} variant="light" className="me-2">
                    <FaShareAlt />
                  </Button>
                ))}
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Modal de paiement */}
      <Modal show={showModal} onHide={handleModalClose} >
        <Modal.Header closeButton>
          <Modal.Title>Formulaire de paiement</Modal.Title>
        </Modal.Header>
        <Modal.Body >
          <Form >
            {/* Choix du mode de paiement */}
            <h5>Choisissez votre mode de paiement</h5>
            <Row className="mb-3">
              <Col  md={4}>
                <Button
                  variant={paymentMethod === "credit" ? "primary" : "light"}
                  onClick={() => setPaymentMethod("credit")}
                  className="w-100"
                >
                  <FaCcVisa className="me-2" /> Carte de Crédit
                </Button>
              </Col>
              <Col  md={4}>
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
                  <Form.Control type="text" placeholder="Entrez votre nom complet" />
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
                <Form.Control type="email" placeholder="Entrez votre email PayPal" />
              </Form.Group>
            )}

            <Button variant="primary" type="submit" className=" mt-3 ">
              Payer maintenant
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default CourseDetail;
