const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

router.post('/', requireAuth, requireRole('patient'), appointmentController.bookAppointment);
router.get('/', requireAuth, appointmentController.getMyAppointments);
router.put('/:id', requireAuth, requireRole('therapist'), appointmentController.updateAppointment);

module.exports = router;
