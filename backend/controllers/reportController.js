const { Op } = require('sequelize');
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
    institution,
    faculty, 
    department, 
    courseCode, 
    encryptedOffender, 
    encryptedDescription 
  } = req.body;

  // Handle Files
  // We store just the filename so we can serve it via static route /uploads/
  const evidenceFiles = req.files ? req.files.map(file => file.filename) : [];

  if (!encryptedOffender || !encryptedDescription) {
    return res.status(400).json({ message: 'Encrypted data is missing' });
  }

  // If using real DB, try to save there
  if (!sequelize.isMock) {
    try {
      const report = await Report.create({
        institution,
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
    institution,
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
  const adminEmail = req.query.adminEmail || '';
  let whereClause = {};

  // Extract institution keyword from admin email (e.g., 'futminna' from 'admin@futminna.edu.ng')
  if (adminEmail) {
    const parts = adminEmail.split('@');
    if (parts.length > 1) {
        const domain = parts[1];
        // Split domain by dot, usually first part is the institution (e.g., 'unilag' in 'unilag.edu.ng')
        // But for 'student@futminna.edu.ng', it's 'futminna'.
        const institutionKeyword = domain.split('.')[0];
        
        // Only apply filter if the keyword is not generic (like 'gmail' or 'yahoo' - though auth requires .edu.ng)
        if (institutionKeyword && institutionKeyword.length > 2) {
            whereClause = {
                institution: {
                    [Op.like]: `%${institutionKeyword}%`
                }
            };
        }
    }
  }

  try {
    // Sequelize: findAll with order and filtering
    const reports = await Report.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json(reports);
  } catch (error) {
    console.warn("⚠️ Database unavailable. Fetching from In-Memory Store.");
    
    // Filter memory reports if needed
    let filteredReports = memoryReports;
    if (adminEmail) {
        const parts = adminEmail.split('@');
        if (parts.length > 1) {
            const institutionKeyword = parts[1].split('.')[0];
            filteredReports = memoryReports.filter(r => 
                r.institution && r.institution.toLowerCase().includes(institutionKeyword.toLowerCase())
            );
        }
    }
    
    res.status(200).json(filteredReports.sort((a, b) => b.createdAt - a.createdAt));
  }
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
