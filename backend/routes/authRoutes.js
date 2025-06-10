const express = require('express');
const { register, approveRegistration, login, logout } = require('../controllers/authController');
const router = express.Router();

router.post('/register', register);
router.post('/approve', approveRegistration);
router.post('/login', login);
router.post('/logout', logout);

module.exports = router;