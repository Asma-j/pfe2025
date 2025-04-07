const express = require('express');
const { register, approveRegistration,login } = require('../controllers/authController');
const router = express.Router();


router.post('/register', register);
router.post('/approve', approveRegistration);
router.post('/login', login);

module.exports = router;
