import axios from "axios";
import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Row, Col, Image } from "react-bootstrap";
import image from "../images/auth.jpg"; // Ensure this path is correct
import "./auth.css";

function Register({ show = true, onClose }) {
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [roleType, setRoleType] = useState("");
  const [niveaux, setNiveaux] = useState([]);
  const [selectedNiveau, setSelectedNiveau] = useState("");
  const [classes, setClasses] = useState([]);
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [matieres, setMatieres] = useState([]);
  const [selectedMatieres, setSelectedMatieres] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/niveaux")
      .then((response) => {
        if (Array.isArray(response.data)) setNiveaux(response.data);
      })
      .catch((error) => console.error("Erreur niveaux :", error));
  }, []);

  useEffect(() => {
    if (roleType === "enseignant" && selectedNiveau) {
      axios
        .get(`http://localhost:5000/api/classes/niveau/${selectedNiveau}`)
        .then((response) => {
          if (Array.isArray(response.data)) setClasses(response.data);
        })
        .catch((error) => console.error("Erreur classes :", error));
    } else {
      setClasses([]);
      setSelectedClasses([]);
    }
  }, [roleType, selectedNiveau]);

  useEffect(() => {
    if (roleType === "enseignant") {
      axios
        .get("http://localhost:5000/api/matieres")
        .then((response) => {
          if (Array.isArray(response.data)) setMatieres(response.data);
        })
        .catch((error) => console.error("Erreur matières :", error));
    } else {
      setMatieres([]);
      setSelectedMatieres([]);
    }
  }, [roleType]);

  useEffect(() => {
    setSelectedNiveau("");
    setSelectedClasses([]);
    setSelectedMatieres([]);
    setErrors({});
  }, [roleType]);

  const handleClassSelection = (classeId) => {
    setSelectedClasses((prev) =>
      prev.includes(classeId)
        ? prev.filter((id) => id !== classeId)
        : [...prev, classeId]
    );
  };

  const handleMatiereSelection = (matiereId) => {
    setSelectedMatieres((prev) =>
      prev.includes(matiereId)
        ? prev.filter((id) => id !== matiereId)
        : [...prev, matiereId]
    );
  };

  const validateForm = () => {
    const newErrors = {};
    if (!prenom) newErrors.prenom = "Prénom est requis";
    if (!nom) newErrors.nom = "Nom est requis";
    if (!email) newErrors.email = "Email est requis";
    if (!motDePasse) newErrors.motDePasse = "Mot de passe est requis";
    if (!roleType) newErrors.roleType = "Veuillez sélectionner un rôle";
    if (!selectedNiveau) newErrors.niveau = "Veuillez sélectionner un niveau";
    if (roleType === "enseignant") {
      if (selectedClasses.length === 0)
        newErrors.classes = "Veuillez sélectionner au moins une classe";
      if (selectedMatieres.length === 0)
        newErrors.matieres = "Veuillez sélectionner au moins une matière";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const roleIdMap = {
        enseignant: 1003,
        etudiant: 2,
      };
      const id_role = roleIdMap[roleType.toLowerCase()];
      if (!id_role) {
        throw new Error("Rôle non valide dans la carte des rôles");
      }

      const payload = {
        prenom,
        nom,
        email,
        mot_de_passe: motDePasse,
        id_role,
        niveau_id: selectedNiveau,
        classes: roleType === "enseignant" ? selectedClasses : [],
        matieres: roleType === "enseignant" ? selectedMatieres : [],
      };
      console.log("Payload envoyé :", payload);

      const response = await axios.post("http://localhost:5000/api/auth/register", payload);
      alert(response.data.message);
      if (onClose) onClose();
    } catch (error) {
      console.error("Erreur inscription :", error.response?.data || error);
      alert("Erreur lors de l'inscription: " + (error.response?.data?.error || error.message));
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
      <Modal.Header closeButton>
        <Modal.Title>Register</Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-0">
        <div className="auth-container">
          <div className="auth-left">
            <img src={image} alt="Classroom" className="w-100 h-100" />
          </div>
          <div className="auth-right">
            <div className="auth-form">
              <Form onSubmit={handleSubmit}>
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group controlId="prenom">
                      <Form.Label>Prénom</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Entrez votre prénom"
                        value={prenom}
                        onChange={(e) => setPrenom(e.target.value)}
                        isInvalid={!!errors.prenom}
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.prenom}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="nom">
                      <Form.Label>Nom</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Entrez votre nom"
                        value={nom}
                        onChange={(e) => setNom(e.target.value)}
                        isInvalid={!!errors.nom}
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.nom}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
                <Form.Group controlId="email" className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Entrez votre adresse email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    isInvalid={!!errors.email}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.email}
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group controlId="motDePasse" className="mb-3">
                  <Form.Label>Mot de passe</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Entrez votre mot de passe"
                    value={motDePasse}
                    onChange={(e) => setMotDePasse(e.target.value)}
                    isInvalid={!!errors.motDePasse}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.motDePasse}
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mb-3">
                 
                  <div>
                    <Form.Check
                      inline
                      label="Enseignant"
                      type="radio"
                      name="roleType"
                      id="roleType-enseignant"
                      value="enseignant"
                      checked={roleType === "enseignant"}
                      onChange={(e) => setRoleType(e.target.value)}
                      isInvalid={!!errors.roleType}
                      required
                    />
                    <Form.Check
                      inline
                      label="Etudiant"
                      type="radio"
                      name="roleType"
                      id="roleType-etudiant"
                      value="etudiant"
                      checked={roleType === "etudiant"}
                      onChange={(e) => setRoleType(e.target.value)}
                      isInvalid={!!errors.roleType}
                      required
                    />
                    {errors.roleType && (
                      <div className="invalid-feedback d-block">{errors.roleType}</div>
                    )}
                  </div>
                </Form.Group>
                {roleType && (
                  <Form.Group controlId="niveau" className="mb-3">
                    <Form.Label>Niveau</Form.Label>
                    <Form.Select
                      value={selectedNiveau}
                      onChange={(e) => setSelectedNiveau(e.target.value)}
                      isInvalid={!!errors.niveau}
                      required
                    >
                      <option value="">Sélectionnez un niveau</option>
                      {niveaux.map((niveau) => (
                        <option key={niveau.id} value={niveau.id}>
                          {niveau.nom}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {errors.niveau}
                    </Form.Control.Feedback>
                  </Form.Group>
                )}
                {roleType === "enseignant" && selectedNiveau && (
                  <>
                    <Form.Group className="mb-3">
                      <Form.Label>Classes</Form.Label>
                      {classes.length > 0 ? (
                        classes.map((classe) => (
                          <Form.Check
                            key={classe.id}
                            id={`classe-${classe.id}`}
                            label={classe.nom}
                            type="checkbox"
                            checked={selectedClasses.includes(classe.id)}
                            onChange={() => handleClassSelection(classe.id)}
                          />
                        ))
                      ) : (
                        <div>Aucune classe disponible pour ce niveau</div>
                      )}
                      {errors.classes && (
                        <div className="invalid-feedback d-block">{errors.classes}</div>
                      )}
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Matières</Form.Label>
                      {matieres.length > 0 ? (
                        matieres.map((matiere) => (
                          <Form.Check
                            key={matiere.id}
                            id={`matiere-${matiere.id}`}
                            label={matiere.nom}
                            type="checkbox"
                            checked={selectedMatieres.includes(matiere.id)}
                            onChange={() => handleMatiereSelection(matiere.id)}
                          />
                        ))
                      ) : (
                        <div>Aucune matière disponible</div>
                      )}
                      {errors.matieres && (
                        <div className="invalid-feedback d-block">{errors.matieres}</div>
                      )}
                    </Form.Group>
                  </>
                )}
                <Button type="submit" className="auth-submit">
                  S'inscrire
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