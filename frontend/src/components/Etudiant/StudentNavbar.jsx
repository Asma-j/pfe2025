import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navbar as BootstrapNavbar, Nav, Container, Dropdown } from 'react-bootstrap';
import { MortarboardFill, Gear, BoxArrowRight } from 'react-bootstrap-icons';
import axios from 'axios';
import defaultProfil from '../images/aupair-2380047_1920.png';
import './student.css';

function StudentNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [profile, setProfile] = useState({
    prenom: '',
    nom: '',
    role: '',
    photo: '',
  });

  // Fetch profile data on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.warn('No token found in localStorage');
          return;
        }
        const response = await axios.get('http://localhost:5000/api/users/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile({
          prenom: response.data.prenom || '',
          nom: response.data.nom || '',
          role: response.data.role || 'Étudiant',
          photo: response.data.photo || '',
        });
      } catch (err) {
        console.error('Error fetching profile:', err.response?.data || err.message);
      }
    };
    fetchProfile();

    // Handle scroll for navbar styling
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login'; // Redirect to login page
  };

  return (
    <BootstrapNavbar
      expand="lg"
      fixed="top"
      className={`transition-all shadow-sm ${isScrolled ? 'bg-white py-2 navbar-light' : 'bg-transparent py-3 navbar-dark'}`}
    >
      <Container>
        <BootstrapNavbar.Brand href="#home" className="d-flex align-items-center">
          <MortarboardFill
            style={{ width: '32px', height: '32px' }}
            className="text-primary me-2"
          />
          <span className="fw-bold fs-4 text-primary">EduLearn</span>
        </BootstrapNavbar.Brand>

        <Nav className="ms-auto d-flex flex-row gap-4">
          <Link to="/" className="nav-link text-primary">Accueil</Link>
          <Link to="/courses" className="nav-link text-primary">Cours</Link>

          <Dropdown align="end">
            <Dropdown.Toggle variant="link" id="dropdown-profile" className="p-0 border-0">
              <img
                src={
                  profile.photo
                    ? `http://localhost:5000/Uploads/${profile.photo}?t=${Date.now()}`
                    : defaultProfil
                }
                alt="Profile"
                className="rounded-circle border shadow"
                style={{
                  width: '45px',
                  height: '40px',
                  objectFit: 'cover',
                  transition: '0.3s ease-in-out',
                }}
              />
            </Dropdown.Toggle>

            <Dropdown.Menu className="shadow-sm p-3 rounded border-0" style={{ minWidth: '200px' }}>
              <div className="d-flex align-items-center px-3 py-3 bg-light rounded">
                <img
                  src={
                    profile.photo
                      ? `http://localhost:5000/Uploads/${profile.photo}?t=${Date.now()}`
                      : defaultProfil
                  }
                  alt="Profile"
                  className="rounded-circle border me-2"
                  style={{
                    width: '55px',
                    height: '55px',
                    objectFit: 'cover',
                    border: '2px solid #ddd',
                  }}
                />
                <div>
                  <div className="fw-bold fs-6">
                    {profile.prenom} {profile.nom}
                  </div>
                  <small className="text-muted">{profile.role || 'Étudiant'}</small>
                </div>
              </div>

              <Dropdown.Item as={Link} to="/profile" className="py-2">
                <Gear className="me-2 text-primary" /> Profil
              </Dropdown.Item>
              <Dropdown.Item onClick={handleLogout} className="py-2 text-danger">
                <BoxArrowRight className="me-2" /> Déconnexion
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Nav>
      </Container>
    </BootstrapNavbar>
  );
}

export default StudentNavbar;