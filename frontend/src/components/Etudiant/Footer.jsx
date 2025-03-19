import React from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { FaEnvelope } from 'react-icons/fa';
import './footer.css'; 
import { MortarboardFill } from 'react-bootstrap-icons';

const Footer = () => {
  return (
    <footer className="footer">
      <Container>
        <Row className="justify-content-between">
          <Col md={6}>
         <MortarboardFill
                   style={{ width: '32px', height: '32px' }}
                   className="text-primary me-2 mb-2"
                 />
                 <span className="fw-bold fs-4 text-primary mb-4">EduLearn</span>
            <p className='mt-3'>Virtual Class for Zoom</p>
            <Form>
              <Form.Group controlId="formEmail">
                <Form.Label>Your Email</Form.Label>
                <div className="d-flex">
                  <Form.Control type="email" placeholder="Enter your email" />
                  <Button variant="primary" type="submit" className="ms-2">
                    <FaEnvelope /> Subscribe
                  </Button>
                </div>
              </Form.Group>
            </Form>
          </Col>
          <Col md={3}>
            <h5>Links</h5>
            <ul className="list-unstyled">
              <li><a href="/careers">Careers</a></li>
              <li><a href="/privacy-policy">Privacy Policy</a></li>
              <li><a href="/terms-conditions">Terms & Conditions</a></li>
            </ul>
          </Col>
        </Row>
        <Row className="mt-3">
          <Col className="text-center">
            <p>© 2021 Class Technologies Inc.</p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;