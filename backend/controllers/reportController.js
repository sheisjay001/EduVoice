const Report = require('../models/Report');
const crypto = require('crypto');
const sequelize = require('../config/database'); // Import sequelize to check isMock

// In-Memory Fallback for Offline Mode
const memoryReports = [];

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

  // If using real DB, try to save there
  if (!sequelize.isMock) {
    try {
      const report = await Report.create({
        faculty,
        department,
        courseCode,
        encryptedOffender,
        encryptedDescription,
        evidence: evidenceFiles
      });

      return res.status(201).json({ 
        message: 'Report submitted successfully', 
        caseId: report.caseId 
      });
    } catch (error) {
      console.error("❌ Database Error in createReport:", error);
      
      // Return detailed error if DB connection exists but query failed
      return res.status(500).json({ 
        message: 'Database Error', 
        detail: error.message 
      });
    }
  }

  // Fallback to Memory only if isMock is true (Offline Mode)
  console.warn("⚠️ Using In-Memory Store for Report (Offline Mode).");
    
  const newReport = {
    id: memoryReports.length + 1,
    caseId: crypto.randomBytes(4).toString('hex').toUpperCase(),
    faculty,
    department,
    courseCode,
    encryptedOffender,
    encryptedDescription,
    evidence: evidenceFiles,
    status: 'Pending',
    createdAt: new Date()
  };
  
  memoryReports.push(newReport);

  res.status(201).json({ 
    message: 'Report submitted successfully (Offline Mode)', 
    caseId: newReport.caseId 
  });
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
    console.warn("⚠️ Database unavailable. Fetching from In-Memory Store.");
    res.status(200).json(memoryReports.sort((a, b) => b.createdAt - a.createdAt));
  }
};

// @desc    Delete all reports (Cleanup)
// @route   DELETE /api/reports
// @access  Private (Admin only)
exports.deleteAllReports = async (req, res) => {
  if (!sequelize.isMock) {
    try {
      await Report.destroy({ where: {}, truncate: true });
      return res.status(200).json({ message: 'All reports deleted from Database.' });
    } catch (error) {
      console.error("❌ Database Error in deleteAllReports:", error);
      return res.status(500).json({ message: 'Database Error', detail: error.message });
    }
  }

  // Clear memory
  memoryReports.length = 0;
  res.status(200).json({ message: 'All reports deleted from Memory.' });
};

// @desc    Check case status
// @route   GET /api/reports/:caseId/status
// @access  Public
exports.getReportStatus = async (req, res) => {
  let status = null;

  try {
    const report = await Report.findOne({ 
      where: { caseId: req.params.caseId },
      attributes: ['status'] // Only return status, nothing else!
    });

    if (report) {
      status = report.status;
    }
  } catch (error) {
    console.warn("⚠️ Database unavailable. Checking In-Memory Store.");
    const report = memoryReports.find(r => r.caseId === req.params.caseId);
    if (report) {
      status = report.status;
    }
  }

  if (!status) {
    return res.status(404).json({ message: 'Case ID not found' });
  }

  res.status(200).json({ status });
};
