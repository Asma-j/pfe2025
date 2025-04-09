const express = require('express');
const router = express.Router();
const courseController = require('../controllers/coursController');
const upload = require('../middleware/upload');

router.post('/courses',upload.single('image'), courseController.createCourse);
router.get('/', courseController.getAllCourses);
router.get('/:id', courseController.getCourseById);
router.put('/:id',upload.single('image'), courseController.updateCourse);
router.delete('/:id', courseController.deleteCourse);

module.exports = router;
