const fs = require('fs');
const path = require('path');
const multer = require('multer');

// Stored locally for now under /uploads (served statically by app.js).
// Swapping to S3/Cloudinary later only means changing this one file's
// storage engine - nothing else in the app needs to change.
const UPLOAD_DIR = path.join(__dirname, '../../uploads/profile-pictures');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    // req.user is set by requireAuth, which MUST run before this middleware
    // in the route definition, or req.user will be undefined here.
    cb(null, `user-${req.user.userId}-${Date.now()}${ext}`);
  },
});

function fileFilter(req, file, cb) {
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    return cb(new Error('Only JPEG, PNG, WEBP, or GIF images are allowed'));
  }
  cb(null, true);
}

const uploadProfilePicture = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

module.exports = uploadProfilePicture;