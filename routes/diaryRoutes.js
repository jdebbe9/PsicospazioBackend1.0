const express = require('express');
const router = express.Router();
const diaryController = require('../controllers/diaryController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

router.post('/', requireAuth, requireRole('patient'), diaryController.createDiaryEntry);
router.get('/', requireAuth, requireRole('patient'), diaryController.getMyDiaryEntries);
router.put('/:entryId', requireAuth, requireRole('patient'), diaryController.updateDiaryEntry);

module.exports = router;
