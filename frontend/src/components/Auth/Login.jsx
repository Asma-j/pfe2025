import React from 'react';
import { Link } from 'react-router-dom';
import image from '../images/auth.jpg';
import './auth.css';

function Login({ show = true, onClose }) {
  if (!show) return null; 

  return (
    <div className="modal-overlay">
      <div className="modal-container">
       
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>

        <div className="auth-container">

          <div className="auth-left">
            <img src={image} alt="Classroom" className="auth-image" />
          </div>

         
          <div className="auth-right">
            <div className="auth-form">
           


              {/* Formulaire */}
              <form>
                <label>User name</label>
                <input type="text" placeholder="Enter your User name" />

                <label>Password</label>
                <input type="password" placeholder="Enter your Password" />

                <div className="auth-remember">
                  <label>
                    <input type="checkbox" /> Remember me
                  </label>
                  <Link to="/forgot" className="auth-forgot">
                    Forgot Password?
                  </Link>
                </div>

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
