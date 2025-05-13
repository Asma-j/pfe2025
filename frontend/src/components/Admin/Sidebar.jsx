import { Nav, Button } from 'react-bootstrap';
import {
  Speedometer,
  People,
  Book,
  Calendar,
  Gear,
  MortarboardFill,
} from 'react-bootstrap-icons';
import './admin.css';

const Sidebar = ({ setCurrentView, currentView, setActiveTab }) => {
  console.log('setActiveTab in Sidebar:', setActiveTab); // Debug log
  return (
    <Nav className="flex-column sidebar">
      <div className="d-flex align-items-center p-3">
        <MortarboardFill
          style={{ width: '28px', height: '28px' }}
          className="text-white me-2"
        />
        <span className="fw-bold fs-4 text-white">EduAdmin</span>
      </div>
      {[
        { icon: Speedometer, label: 'Tableau de bord', view: 'dashboard' },
        { icon: People, label: 'Étudiants', view: 'user', tab: 'students' },
        { icon: People, label: 'Enseignant', view: 'user', tab: 'teachers' },
        { icon: Book, label: 'Cours', view: 'courses' },
        { icon: Calendar, label: 'Emploi du temps', view: 'schedule' },
        { icon: Gear, label: 'Paramètres', view: 'settings' },
      ].map(({ icon: Icon, label, view, tab }) => (
        <Button
          key={label}
          variant="link"
          onClick={() => {
            setCurrentView(view);
            if (tab) {
              setActiveTab(tab); // Call setActiveTab if tab exists
            }
          }}
          className={`d-flex align-items-center mb-1 text-start sidebar-btn ${
            currentView === view ? 'active' : ''
          }`}
        >
          <Icon className="me-3" size={22} />
          {label}
        </Button>
      ))}
    </Nav>
  );
};

export default Sidebar;