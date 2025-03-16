const userMiddleware = (req, res, next) => {
  console.log("middleware user", req.path)
  next();
}
const multer = require("multer");
const path = require("path");
const jwt = require("jsonwebtoken");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "storage/uploads/"); // Folder tempat menyimpan file
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Format nama unik
  },
});

// Filter tipe file (hanya gambar yang diizinkan)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Format file tidak didukung"), false);
  }
};

// Inisialisasi `multer`
const upload = multer({
  storage,
  fileFilter
});

// Middleware untuk menangkap file dengan nama "gambar"
const uploadSingle = upload.single("gambar");
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      error: "akses ditolak, tidak dapat meneruskan request!"
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      error: "Invalid or expired token!"
    });
  }
};

module.exports = {
  authenticateToken,
  uploadSingle,
  userMiddleware,
};