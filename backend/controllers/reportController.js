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
  console.log("🔍 [CreateReport] Request received.");
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
      console.log("🔍 [CreateReport] Attempting to save to DB...");
      
      const report = await Report.create({
        institution,
        faculty,
        department,
        courseCode,
        encryptedOffender,
        encryptedDescription,
        evidence: evidenceFiles
      });
      console.log("✅ [CreateReport] Saved to DB. CaseID:", report.caseId);

      return res.status(201).json({ 
        message: 'Report submitted successfully', 
        caseId: report.caseId 
      });
    } catch (error) {
      console.error("❌ Database Error in createReport:", error);
      
      // Return detailed error if DB connection exists but query failed
      return res.status(500).json({ 
        message: 'Database Error: ' + error.message, 
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

        // --- BYPASS FILTER FOR SUPER ADMIN (Debug) ---
        // If the email is the specific demo admin, show ALL reports regardless of institution.
        if (adminEmail === 'joy.m2200251@st.futminna.edu.ng') {
            console.log(`[ReportController] Super Admin '${adminEmail}' detected. Showing ALL reports.`);
            // No whereClause.institution filter applied.
        } 
        else if (adminEmail) {
            // Normal Logic for other admins
            const parts = adminEmail.split('@');
            if (parts.length > 1) {
                const domain = parts[1]; // e.g., 'st.futminna.edu.ng' or 'futminna.edu.ng'
                
                // Check if domain contains 'futminna' (handles 'st.futminna.edu.ng', 'futminna.edu.ng')
                 if (domain.toLowerCase().includes('futminna')) {
                      console.log(`[ReportController] FUT Minna admin detected: ${adminEmail}`);
                      whereClause.institution = {
                         [Op.or]: [
                             { [Op.like]: '%futminna%' }, 
                             { [Op.like]: '%FUTMINNA%' },
                             { [Op.like]: '%FUTminna%' },
                             { [Op.like]: '%FUT minna%' },
                             { [Op.like]: '%Federal University Of Technology Minna%' }
                         ]
                      };
                 } else {
                    // Default logic for other institutions
                    const institutionKeyword = domain.split('.')[0];
                    if (institutionKeyword && institutionKeyword.length > 2) {
                        whereClause.institution = { [Op.like]: `%${institutionKeyword}%` };
                        console.log(`[ReportController] Filtering reports for admin '${adminEmail}' with keyword '${institutionKeyword}'`);
                    }
                }
            }
        }

        try {
            console.log(`[ReportController] Querying DB with whereClause:`, JSON.stringify(whereClause, null, 2));
            if (!sequelize.isMock) {
                const reports = await Report.findAll({ 
                    where: whereClause,
                    order: [['createdAt', 'DESC']] 
                });
                console.log(`[ReportController] Found ${reports.length} reports for ${adminEmail}`);
                return res.json(reports);
            } else {
                console.warn("⚠️ [ReportController] Running in MOCK mode.");
                // Filter memory reports
                let filteredReports = memoryReports;
                if (whereClause.institution) {
                    try {
                        let keyword = "";
                        if (typeof whereClause.institution === 'string') {
                            keyword = whereClause.institution;
                        } else if (whereClause.institution[Op.like]) {
                            keyword = whereClause.institution[Op.like].replace(/%/g, '');
                        } else if (whereClause.institution[Op.or]) {
                            // If it's an OR array, just use the first keyword for mock filtering
                            const firstOr = whereClause.institution[Op.or][0];
                            keyword = firstOr[Op.like] ? firstOr[Op.like].replace(/%/g, '') : "";
                        }
                        
                        if (keyword) {
                            filteredReports = memoryReports.filter(r => 
                                r.institution && r.institution.toLowerCase().includes(keyword.toLowerCase())
                            );
                        }
                    } catch (filterError) {
                        console.error("Error filtering mock reports:", filterError);
                        // Fallback to all reports if filtering fails in mock mode
                    }
                }
                return res.json(filteredReports.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)));
            }
        } catch (error) {
            console.error("❌ Error fetching reports (Stack):", error);
            res.status(500).json({ 
                message: 'Server error fetching reports', 
                error: error.message,
                detail: error.stack // Added stack trace for easier debugging
            });
        }
};

// @desc    Get report status
// @route   GET /api/reports/:caseId/status
// @access  Public (with Case ID)
exports.getReportStatus = async (req, res) => {
  const { caseId } = req.params;

  try {
    if (!sequelize.isMock) {
        const report = await Report.findOne({ 
            where: { caseId },
            attributes: ['status', 'updatedAt']
        });

        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }

        res.json({
            status: report.status,
            updatedAt: report.updatedAt
        });
    } else {
        const report = memoryReports.find(r => r.caseId === caseId);
        if (!report) return res.status(404).json({ message: 'Report not found' });
        return res.json({ 
            status: report.status, 
            updatedAt: report.createdAt
        });
    }
  } catch (error) {
    console.error("Error fetching status:", error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update report status
// @route   PATCH /api/reports/:caseId/status
// @access  Private (Admin only)
exports.updateReportStatus = async (req, res) => {
  const { status } = req.body;
  const { caseId } = req.params;

  if (!status) {
    return res.status(400).json({ message: 'Status is required' });
  }

  try {
    if (!sequelize.isMock) {
        const report = await Report.findOne({ where: { caseId } });

        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }

        report.status = status;
        await report.save();
        
        res.status(200).json(report);
    } else {
        const memReport = memoryReports.find(r => r.caseId === caseId);
        if (memReport) {
            memReport.status = status;
            return res.status(200).json(memReport);
        }
        return res.status(404).json({ message: 'Report not found' });
    }
  } catch (error) {
    console.error("Error updating report status:", error);
    res.status(500).json({ message: 'Server error updating report status' });
  }
};
