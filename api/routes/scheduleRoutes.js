const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// Timetable
router.get('/', scheduleController.getSchedules);
router.post('/', scheduleController.createSchedule);
router.put('/:id', scheduleController.updateSchedule);
router.delete('/:id', scheduleController.deleteSchedule);

// Calendar Events
router.get('/events/all', scheduleController.getEvents);
router.post('/events', scheduleController.createEvent);
router.put('/events/:id', scheduleController.updateEvent);
router.delete('/events/:id', scheduleController.deleteEvent);

module.exports = router;
