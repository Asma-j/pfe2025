import React from 'react';
import { Nav } from 'react-bootstrap';
import'./admin.css'
function Sidebar() {
  return (
    <div className="sidebar" style={{ width: '200px', height: '100vh', backgroundColor: '#f8f9fa' }}>
      <Nav className="flex-column">
        <Nav.Link href="#">Dashboard</Nav.Link>
        <Nav.Link href="#">Courses</Nav.Link>
        <Nav.Link href="#">Student Schedule</Nav.Link>
        <Nav.Link href="#">Analytics</Nav.Link>
      </Nav>
    </div>
  );
}

export default Sidebar;
