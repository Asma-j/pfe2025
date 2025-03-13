import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
        if (Array.isArray(response.data)) {
          setRoles(response.data);
        } else {
          console.error("Données reçues incorrectes :", response.data);
        }
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération des rôles :", error);
      });
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

      if (response.data.emailSent) {
        alert("Inscription réussie ! Veuillez consulter votre boîte email.");
      } else {
        alert("Inscription réussie !");
      }

      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error("Erreur lors de l'inscription :", error.response?.data || error);
      alert("Erreur lors de l'inscription.");
    }
  };



  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <button className="modal-close" onClick={() => onClose && onClose()}>
          ✕
        </button>


        <div className="auth-container">
          <div className="auth-left">
            <img src={image} alt="Classroom" className="auth-image" />
          </div>

          <div className="auth-right">
            <div className="auth-form">



              <form onSubmit={handleSubmit}>
                <div className="name-row">
                  <div className="name-input">
                    <label>First Name</label>
                    <input
                      type="text"
                      placeholder="Enter your first name"
                      value={prenom}
                      onChange={(e) => setPrenom(e.target.value)}
                      required
                    />
                  </div>

                  <div className="name-input">
                    <label>Last Name</label>
                    <input
                      type="text"
                      placeholder="Enter your last name"
                      value={nom}
                      onChange={(e) => setNom(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="Enter your Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                <label>Password</label>
                <input
                  type="password"
                  placeholder="Enter your Password"
                  value={motDePasse}
                  onChange={(e) => setMotDePasse(e.target.value)}
                  required
                />

                <label>Role</label>
                <div className="custom-select">
                  <select value={idRole} onChange={(e) => setIdRole(e.target.value)} required>
                    <option value="">Select a role</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>{role.nom_role}</option>
                    ))}
                  </select>
                </div>

                <button type="submit" className="auth-submit">Register</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
