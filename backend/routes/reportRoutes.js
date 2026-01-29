const express = require('express');
const router = express.Router();
const { createReport, getReports, getReportStatus } = require('../controllers/reportController');
const upload = require('../middleware/uploadMiddleware');

router.post('/', upload.array('evidence', 5), createReport);
router.get('/', getReports);
router.get('/:caseId/status', getReportStatus);

module.exports = router;
