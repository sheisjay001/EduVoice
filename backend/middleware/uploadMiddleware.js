const multer = require('multer');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Configure Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Use /tmp for Vercel/Serverless, or backend/uploads/ for local
    // We use path.join to ensure it goes to the correct backend/uploads folder regardless of CWD
    const localUploadDir = path.join(__dirname, '..', 'uploads');
    const uploadDir = process.env.VERCEL ? os.tmpdir() : localUploadDir;
    
    // Ensure directory exists (only for local 'uploads/', /tmp always exists)
    if (!process.env.VERCEL && !fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Unique filename: fieldname-timestamp-random.ext
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File Filter (Images and Videos only)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi|mkv/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only images and videos are allowed!'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: fileFilter
});

module.exports = upload;
