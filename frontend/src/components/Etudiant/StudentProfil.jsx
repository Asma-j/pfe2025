import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Card, Alert, Image } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './student.css';
import defaultProfil from '../images/aupair-2380047_1920.png';

const StudentProfile = () => {
  const [profile, setProfile] = useState({
    prenom: '',
    nom: '',
    email: '',
    photo: '',
    role: '',
    status: '',
  });
  const [newProfile, setNewProfile] = useState({
    prenom: '',
    nom: '',
    email: '',
    mot_de_passe: '',
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch profile data on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/users/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(response.data);
        setNewProfile({
          prenom: response.data.prenom,
          nom: response.data.nom,
          email: response.data.email,
          mot_de_passe: '',
        });
      } catch (err) {
        setError(err.response?.data?.error || 'Erreur lors du chargement du profil');
      }
    };
    fetchProfile();
  }, []);

  // Handle text input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProfile({ ...newProfile, [name]: value });
  };

  // Handle file input change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        setError('Veuillez sélectionner une image (JPEG, PNG, JPG).');
        setPhotoFile(null);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('L\'image est trop volumineuse. Limite : 5MB.');
        setPhotoFile(null);
        return;
      }
      setPhotoFile(file);
    } else {
      setPhotoFile(null);
    }
  };

  // Handle profile update submission
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('prenom', newProfile.prenom);
      formData.append('nom', newProfile.nom);
      formData.append('email', newProfile.email);
      if (newProfile.mot_de_passe) {
        formData.append('mot_de_passe', newProfile.mot_de_passe);
      }
      if (photoFile) {
        formData.append('photo', photoFile);
      }

      // Debug FormData contents
      for (let [key, value] of formData.entries()) {
        console.log(`FormData: ${key} =`, value);
      }

      const response = await axios.put(
        'http://localhost:5000/api/users/profile',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
          timeout: 10000, // Increase timeout to 10 seconds
        }
      );
      console.log('Update response:', response.data);
      setProfile(response.data.user);
      setSuccess(response.data.message);
      setIsEditing(false);
      setPhotoFile(null);
    } catch (err) {
      console.error('Update error:', err.response?.data, err.message);
      setError(err.response?.data?.error || 'Erreur lors de la mise à jour du profil');
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle edit mode
  const toggleEditMode = () => {
    setIsEditing(!isEditing);
    setError('');
    setSuccess('');
    setPhotoFile(null);
  };

  return (
    <Container className="my-5">
      <Card className="shadow-sm">
        <Card.Body>
          <h2 className="text-center mb-4">Profil Étudiant</h2>

          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          {!isEditing ? (
            <div className="text-center">
              <Image
                src={
                  profile.photo
                    ? `http://localhost:5000/Uploads/${profile.photo}?t=${Date.now()}`
                    : defaultProfil
                }
                alt="Profile"
                roundedCircle
                className="mb-3"
                style={{ width: '100px', height: '100px', objectFit: 'cover' }}
              />
              <h4>{profile.prenom} {profile.nom}</h4>
              <p><strong>Email:</strong> {profile.email}</p>
              <p><strong>Rôle:</strong> {profile.role}</p>
              <p><strong>Statut:</strong> {profile.status}</p>
              <Button variant="primary" onClick={toggleEditMode}>
                Modifier le profil
              </Button>
            </div>
          ) : (
            <Form onSubmit={handleUpdateProfile}>
              <Form.Group className="mb-3">
                <Form.Label>Prénom</Form.Label>
                <Form.Control
                  type="text"
                  name="prenom"
                  value={newProfile.prenom}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Nom</Form.Label>
                <Form.Control
                  type="text"
                  name="nom"
                  value={newProfile.nom}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={newProfile.email}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Mot de passe (laisser vide pour ne pas modifier)</Form.Label>
                <Form.Control
                  type="password"
                  name="mot_de_passe"
                  value={newProfile.mot_de_passe}
                  onChange={handleInputChange}
                  placeholder="Nouveau mot de passe"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Photo de profil</Form.Label>
                <Form.Control
                  type="file"
                  name="photo"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </Form.Group>

              <div className="d-flex justify-content-between">
                <Button variant="secondary" onClick={toggleEditMode}>
                  Annuler
                </Button>
                <Button type="submit" variant="primary" disabled={isLoading}>
                  {isLoading ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
              </div>
            </Form>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default StudentProfile;