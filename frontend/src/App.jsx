import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import StudentDashboard from './components/Etudiant/StudentDashboard';
import AdminDashboard from './components/Admin/AdminDashboard';
import Courses from './components/Etudiant/Courses';
import CourseDetail from './components/Etudiant/CourseDetail';
function App() {
  const location = useLocation();
  const state = location.state || {}; 


  return (
    <>

      <Routes location={state.backgroundLocation || location}>
      <Route path="/" element={<Home />} />
      <Route path="/cours/:title" element={<Courses />} />
      <Route path="/course/:courseName" element={<CourseDetail/>} />
      <Route path="/student" element={<StudentDashboard />} />
      <Route path="/admin" element={<AdminDashboard/>} />
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
