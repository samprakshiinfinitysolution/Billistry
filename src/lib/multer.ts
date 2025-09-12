import multer from "multer";
import path from "path";

// Define storage
const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, "./public/uploads");
  },
  filename: function (_req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

export const upload = multer({ storage });
