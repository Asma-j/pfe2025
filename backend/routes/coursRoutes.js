const express = require('express');
const router = express.Router();
const courseController = require('../controllers/coursController');
const upload = require('../middleware/upload');
const authMiddleware = require('../middleware/auth');

router.post('/', authMiddleware, upload, courseController.createCourse);
router.get('/', courseController.getAllCourses);
router.get('/:id', courseController.getCourseById);
router.put('/:id', authMiddleware, upload, courseController.updateCourse);
router.delete('/:id', authMiddleware, courseController.deleteCourse);

module.exports = router;