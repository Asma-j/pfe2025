import React, { useState, useEffect } from 'react';  // Import hooks
import { Link } from 'react-router-dom';  // Import Link for navigation
import {
  Navbar as BootstrapNavbar,  // Rename the imported Navbar to avoid conflict
  Nav, 
  Container, 
  Dropdown
} from 'react-bootstrap';  // Import required Bootstrap components
import { MortarboardFill, Gear, BoxArrowRight } from 'react-bootstrap-icons';  // Import icons
import profil from '../images/aupair-2380047_1920.png';  // Profile image import
import './student.css';  // Your custom CSS file

// Rename the custom Navbar component to StudentNavbar
function StudentNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    
    // Cleanup the event listener on unmount
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleProfileClick = () => {
    console.log('Profile clicked');
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
          {/* Navbar Links */}
          <Link to="/" className="nav-link text-primary">Accueil</Link>
          <Link to="/courses" className="nav-link text-primary">Cours</Link>

          {/* Profile Dropdown */}
          <Dropdown align="end">
            <Dropdown.Toggle variant="link" id="dropdown-profile" className="p-0 border-0">
              <img
                src={profil}
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
                  src={profil}
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
                  <div className="fw-bold fs-6">John Doe</div>
                  <small className="text-muted">Admin</small>
                </div>
              </div>

              <Dropdown.Item href="#/profile" className="py-2">
                <Gear className="me-2 text-primary" /> Paramètres
              </Dropdown.Item>
              <Dropdown.Item href="#/logout" className="py-2 text-danger">
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
