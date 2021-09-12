import multer from "multer";
import path from "path";

// import pkg from "multer-storage-cloudinary";
// import cloudinary from "./cloudinary.js";

// const { CloudinaryStorage } = pkg;

// const storage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: {
//     folder: "Purplespace",
//     format: async (req, file) => "png,jpg,jpeg",
//   },
// });
// Multer config
export default multer({
  storage: multer.diskStorage({}),
  fileFilter: (req, file, cb) => {
    let ext = path.extname(file.originalname);
    if (ext !== ".jpg" && ext !== ".jpeg" && ext !== ".png") {
      cb(new Error("File type is not supported"), false);
      return;
    }
    cb(null, true);
  },
});
