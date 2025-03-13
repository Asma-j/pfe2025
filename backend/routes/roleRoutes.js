const express = require('express');
const { getRoles, addRole } = require('../controllers/roleController');

const router = express.Router();

router.get('/', getRoles);
router.post('/addRole', addRole);

module.exports = router;
