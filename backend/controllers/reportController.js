const Report = require('../models/Report');

// @desc    Submit a new anonymous report
// @route   POST /api/reports
// @access  Private
exports.createReport = async (req, res) => {
  const { 
    faculty, 
    department, 
    courseCode, 
    encryptedOffender, 
    encryptedDescription 
  } = req.body;

  // Handle Files
  const evidenceFiles = req.files ? req.files.map(file => file.path) : [];

  if (!encryptedOffender || !encryptedDescription) {
    return res.status(400).json({ message: 'Encrypted data is missing' });
  }

  try {
    const report = await Report.create({
      faculty,
      department,
      courseCode,
      encryptedOffender,
      encryptedDescription,
      evidence: evidenceFiles
    });

    res.status(201).json({ 
      message: 'Report submitted successfully', 
      caseId: report.caseId 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error submitting report' });
  }
};

// @desc    Get all reports (For Admin Dashboard)
// @route   GET /api/reports
// @access  Private (Admin only)
exports.getReports = async (req, res) => {
  try {
    // Sequelize: findAll with order
    const reports = await Report.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json(reports);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error fetching reports' });
  }
};

// @desc    Check case status
// @route   GET /api/reports/:caseId/status
// @access  Public
exports.getReportStatus = async (req, res) => {
  try {
    const report = await Report.findOne({ 
      where: { caseId: req.params.caseId },
      attributes: ['status'] // Only return status, nothing else!
    });

    if (!report) {
      return res.status(404).json({ message: 'Case ID not found' });
    }

    res.status(200).json({ status: report.status });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error checking status' });
  }
};
