const express = require('express');
const {
  getUsers,
  getStudents,
  getTeachers,
  getStudentsByClasse,
  addStudentToClasse,
  addUser,
  getApprovedUsers,
  updateUser,
  deleteUser,
  getProfile,
  updateProfile,
} = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');
const profileUpload = require('../middleware/profileUpload'); // New middleware

const router = express.Router();

router.get('/', getUsers);
router.get('/students', getStudents);
router.get('/students/classe/:classeId', getStudentsByClasse);
router.post('/students/classe', addStudentToClasse);
router.get('/teachers', getTeachers);
router.post('/addUser', addUser);
router.get('/approved', getApprovedUsers);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, profileUpload, updateProfile);

module.exports = router;