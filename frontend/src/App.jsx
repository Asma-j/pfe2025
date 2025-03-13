import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import StudentDashboard from './components/Etudiant/StudentDashboard';

function App() {
  const location = useLocation();
  const state = location.state || {}; 

  return (
    <>

      <Routes location={state.backgroundLocation || location}>
      <Route path="/" element={<Home />} />
      <Route path="/student" element={<StudentDashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register onClose={() => {}} />} />

      </Routes>

      {state.backgroundLocation && (
        <Routes>
          
          <Route path="/login" element={<Login onClose={() => window.history.back()} />} />
          <Route path="/register" element={<Register onClose={() => window.history.back()} />} />
        </Routes>
      )}
    </>
  );
}

export default App;
