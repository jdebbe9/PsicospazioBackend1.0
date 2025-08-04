const express = require('express');
const router = express.Router();
const questionnaireController = require('../controllers/questionnaireController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

router.post('/', requireAuth, requireRole('patient'), questionnaireController.submitQuestionnaire);
router.get('/', requireAuth, requireRole('patient'), questionnaireController.getMyQuestionnaire);

module.exports = router;
