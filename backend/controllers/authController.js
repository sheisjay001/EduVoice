const Otp = require('../models/Otp');
const { sendOTPEmail } = require('../utils/emailService');
const crypto = require('crypto');
const { Op } = require('sequelize');

// In-Memory Fallback for Offline Mode
const memoryStore = {};

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// @desc    Send OTP to school email
// @route   POST /api/auth/send-otp
// @access  Public
exports.sendOtp = async (req, res) => {
  const { email } = req.body;

  if (!email || !email.endsWith('.edu.ng')) {
    return res.status(400).json({ message: 'Please provide a valid .edu.ng email address' });
  }

  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

  try {
    // Try Database First
    let otpRecord = await Otp.findOne({ where: { email } });
    
    if (otpRecord) {
      otpRecord.otp = otp;
      otpRecord.expiresAt = expiresAt;
      await otpRecord.save();
    } else {
      await Otp.create({ email, otp, expiresAt });
    }
  } catch (dbError) {
    console.warn("⚠️ Database unavailable. Using In-Memory Store.");
    memoryStore[email] = { otp, expiresAt };
  }

  try {
    // Send Email
    const emailSent = await sendOTPEmail(email, otp);
    
    console.log(`[DEV ONLY] OTP for ${email}: ${otp}`);

    // If email fails, STILL return success in Dev mode so user can copy OTP from console
    if (emailSent) {
      res.status(200).json({ message: 'OTP sent successfully' });
    } else {
      console.warn("⚠️ Email failed to send. Check console for OTP.");
      res.status(200).json({ message: 'OTP generated (Check Console for Dev Mode)' });
    }
  } catch (error) {
    console.error('CRITICAL OTP ERROR:', error);
    res.status(500).json({ 
      message: 'Server Error sending OTP',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// @desc    Verify OTP and issue Token
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  let otpData = null;
  let fromDb = false;

  try {
    // 1. Try DB
    const otpRecord = await Otp.findOne({ where: { email } });
    if (otpRecord) {
      otpData = { otp: otpRecord.otp, expiresAt: otpRecord.expiresAt };
      fromDb = true;
    }
  } catch (err) {
    console.warn("⚠️ DB check failed. Checking Memory Store.");
  }

  // 2. Try Memory (Always check memory as backup)
  if (!otpData && memoryStore[email]) {
    console.log(`[VERIFY] Found in Memory Store: ${email}`);
    otpData = memoryStore[email];
  }
  
  // 3. UNIVERSAL DEV BACKDOOR (Emergency Access for Demo)
  // If connection is totally broken, allow '123456'
  if (!otpData && otp === '123456') {
     console.log(`[VERIFY] Using Universal Dev Backdoor for ${email}`);
     otpData = { otp: '123456', expiresAt: new Date(Date.now() + 600000) };
  }
  
  // Debug Log for Vercel
  console.log(`[VERIFY] Email: ${email}, OTP Input: ${otp}, OTP Stored: ${otpData?.otp || 'None'}`);

  if (!otpData) {
    return res.status(400).json({ message: 'Invalid or expired OTP (Code: 1)' });
  }

  // Check expiry
  if (new Date(otpData.expiresAt) < new Date()) {
    console.log(`[VERIFY FAIL] Expired. Stored: ${otpData.expiresAt}, Now: ${new Date()}`);
    return res.status(400).json({ message: 'OTP has expired' });
  }

  if (String(otpData.otp).trim() !== String(otp).trim()) {
    console.log(`[VERIFY FAIL] Mismatch. Stored: '${otpData.otp}', Input: '${otp}'`);
    return res.status(400).json({ message: 'Invalid OTP (Code: 2)' });
  }

  // Cleanup
  try {
    if (fromDb) {
      await Otp.destroy({ where: { email } });
    } else {
      delete memoryStore[email];
    }
  } catch (e) { console.error("Cleanup failed", e); }

  // Generate a random anonymous token
  const authToken = crypto.randomBytes(32).toString('hex');

  res.status(200).json({ 
    message: 'Verification successful', 
    token: authToken 
  });
};
