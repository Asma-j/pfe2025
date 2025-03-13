const express = require('express');
const router = express.Router();
const courseController = require('../controllers/coursController');


router.post('/courses', courseController.createCourse);
router.get('/', courseController.getAllCourses);
router.get('/courses/:id', courseController.getCourseById);
router.put('/courses/:id', courseController.updateCourse);
router.delete('/courses/:id', courseController.deleteCourse);

module.exports = router;
