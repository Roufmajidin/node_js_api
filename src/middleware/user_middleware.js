const userMiddleware = (req, res, next) =>{
    console.log("middleware user", req.path)
    next();
}
const multer = require("multer");
const path = require("path");

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
const upload = multer({ storage, fileFilter });

// Middleware untuk menangkap file dengan nama "gambar"
const uploadSingle = upload.single("gambar");

module.exports = uploadSingle;
module.exports = userMiddleware;