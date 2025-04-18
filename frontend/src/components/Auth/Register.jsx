import axios from "axios";
import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Row, Col, Image } from "react-bootstrap";
import image from "../images/auth.jpg";
import "./auth.css";

function Register({ show = true, onClose }) {
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [roles, setRoles] = useState([]);
  const [idRole, setIdRole] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/roles")
      .then((response) => {
        console.log("Response data:", response.data);
        if (Array.isArray(response.data)) setRoles(response.data);
      })
      .catch((error) => console.error("Erreur rôles :", error));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/api/auth/register", {
        prenom,
        nom,
        email,
        mot_de_passe: motDePasse,
        id_role: idRole,
      });
      alert(response.data.message);
      if (onClose) onClose();
    } catch (error) {
      console.error("Erreur inscription :", error.response?.data || error);
      alert("Erreur lors de l'inscription.");
    }
  };

  return (
    <Modal
      show={show}
      onHide={onClose}
      centered
      size="lg"
      dialogClassName="custom-modal"
    >
      {/* Modal Header with Title and Close Button */}
      <Modal.Header closeButton >
        <modal-close>Register</modal-close>
      </Modal.Header>

      {/* Modal Body */}
      <Modal.Body className="p-0">
        <div className="auth-container">
          {/* Left Side: Image */}
          <div className="auth-left">
            <Image src={image} alt="Classroom" fluid className="auth-image" />
          </div>

          {/* Right Side: Form */}
          <div className="auth-right">
            <div className="auth-form">
              <Form onSubmit={handleSubmit}>
                {/* Prénom and Nom in a Row */}
                <Row className="mb-3">
                  <Col md={4}>
                    <Form.Group controlId="prenom">
                      <Form.Label>Prénom</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter your first name"
                        value={prenom}
                        onChange={(e) => setPrenom(e.target.value)}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group controlId="nom">
                      <Form.Label>Nom</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter your last name"
                        value={nom}
                        onChange={(e) => setNom(e.target.value)}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Email */}
                <Form.Group controlId="email" className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter your Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Form.Group>

                {/* Mot de passe */}
                <Form.Group controlId="motDePasse" className="mb-3">
                  <Form.Label>Mot de passe</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Enter your Password"
                    value={motDePasse}
                    onChange={(e) => setMotDePasse(e.target.value)}
                    required
                  />
                </Form.Group>

                {/* Role */}
                <Form.Group controlId="idRole" className="mb-3">
                  <Form.Label>Role</Form.Label>
                  <Form.Select
                    value={idRole}
                    onChange={(e) => setIdRole(e.target.value)}
                    required
                  >
                    <option value="">Select a role</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.nom_role}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

            
                  <Button type="submit" className="auth-submit">
                    Register
                  </Button>
             
              </Form>
            </div>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
}

export default Register;