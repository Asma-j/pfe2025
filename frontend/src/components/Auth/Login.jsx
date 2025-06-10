import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import image from '../images/auth.jpg';
import './auth.css';

function Login({ show = true, onClose }) {
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  if (!show) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        mot_de_passe: motDePasse,
      }, {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' },
      });
      const { token, role, userId } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      localStorage.setItem('userId', userId);

      console.log('Login successful:', { token, role, userId });

      if (role.toLowerCase() === 'admin') {
        navigate('/admin');
      } else if (role.toLowerCase() === 'etudiant') {
        navigate('/cours');
      } else {
        navigate('/teacher');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.error || 'Échec de la connexion au serveur. Vérifiez votre connexion réseau ou le statut du serveur.');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="auth-container">
          <div className="auth-left">
            <img src={image} alt="Classroom" className="auth-image" />
          </div>
          <div className="auth-right">
            <div className="auth-form">
              <form onSubmit={handleLogin}>
                {error && <p className="auth-error">{error}</p>}
                <label>Email</label>
                <input
                  type="text"
                  placeholder="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <label>Mot de passe</label>
                <input
                  type="password"
                  placeholder="Mot de passe"
                  value={motDePasse}
                  onChange={(e) => setMotDePasse(e.target.value)}
                />
                <button type="submit" className="auth-submit">
                  Login
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;