const express = require('express');
const router = express.Router();
const courseController = require('../controllers/coursController');
const upload = require('../middleware/upload');
const authMiddleware = require('../middleware/auth');


router.post('/', authMiddleware, upload.single('image'), courseController.createCourse);
router.get('/', courseController.getAllCourses);
router.get('/:id', courseController.getCourseById);
router.put('/:id',upload.single('image'), courseController.updateCourse);
router.delete('/:id', courseController.deleteCourse);

module.exports = router;
