const nodemailer = require('nodemailer');

const sendOTPEmail = async (studentEmail, otpCode) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: 'novakidczechrepublic@gmail.com',
        pass: 'tpft zvhz ujen csfj'
      }
    });

    const mailOptions = {
      from: '"Edu-Voice Security" <novakidczechrepublic@gmail.com>',
      to: studentEmail,
      subject: 'Your One-Time Access Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #00A859;">Edu-Voice Verification</h2>
          <p>You are initiating an anonymous report session. Use this code to proceed:</p>
          <div style="background-color: #f4f4f4; padding: 15px; text-align: center; border-radius: 5px; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #333;">
            ${otpCode}
          </div>
          <p style="color: #666; font-size: 12px; margin-top: 20px;">
            If you did not request this, please ignore this email. Your identity remains anonymous.
          </p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ OTP Sent to:", studentEmail);
    return true;

  } catch (error) {
    console.error("❌ Email Failed:", error);
    return false;
  }
};

module.exports = { sendOTPEmail };
