const express = require('express');
const router = express.Router();
const { createReport, getReports, getReportStatus, updateReportStatus, deleteAllReports } = require('../controllers/reportController');
const upload = require('../middleware/uploadMiddleware');

router.post('/', upload.array('evidence', 5), createReport);
router.get('/', getReports);
router.delete('/all', deleteAllReports);
router.get('/:caseId/status', getReportStatus);
router.patch('/:caseId/status', updateReportStatus);

module.exports = router;
