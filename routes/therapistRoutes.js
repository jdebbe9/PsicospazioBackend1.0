const express = require('express');
const router = express.Router();
const therapistController = require('../controllers/therapistController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

router.get('/patients', requireAuth, requireRole('therapist'), therapistController.getAllPatients);
router.get('/patients/:id', requireAuth, requireRole('therapist'), therapistController.getPatientDetails);

module.exports = router;
