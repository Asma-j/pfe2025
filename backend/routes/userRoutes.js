const express = require('express');
const { getUsers, addUser,getApprovedUsers,updateUser,deleteUser } = require('../controllers/userController');

const router = express.Router();

router.get('/', getUsers);
router.post('/addUser', addUser);
router.get('/approved',getApprovedUsers);
router.put('/users/:id', updateUser); 
router.delete('/users/:id',deleteUser);
module.exports = router;
