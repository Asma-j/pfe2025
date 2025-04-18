const express = require('express');
const { getUsers, addUser,getApprovedUsers,updateUser,deleteUser,getProfile ,updateProfile} = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.get('/', getUsers);
router.post('/addUser', addUser);
router.get('/approved',getApprovedUsers);
router.put('/users/:id', updateUser); 
router.delete('/users/:id',deleteUser);
router.get('/profile', authMiddleware, getProfile);
router.put('/profile',authMiddleware,updateProfile);
module.exports = router;
