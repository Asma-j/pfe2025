import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import AdminDashboard from './components/Admin/AdminDashboard';
import Courses from './components/Etudiant/Courses';
import CourseDetail from './components/Etudiant/CourseDetail';
import TeacherDashboard from './components/Enseignant/TeacherDashboard';
import CourseContent from './components/Etudiant/CourseContent';
function App() {
  const location = useLocation();
  const state = location.state || {}; 


  return (
    <>

      <Routes location={state.backgroundLocation || location}>
      <Route path="/" element={<Home />} />
      <Route path="/cours" element={<Courses />} />
      <Route path="/course/:id" element={<CourseDetail/>} />
      <Route path="/course/:id/content" element={<CourseContent />} />     
   
      <Route path="/admin" element={<AdminDashboard/>} />
      <Route path="/teacher" element={<TeacherDashboard/>} />
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
