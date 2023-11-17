const express = require("express");
const multer = require("multer");

const validations = require("../middlewares/validations/categoryValidation");
const validator = require("../middlewares/validations/validator");
const controller = require("../controllers/categoryController");
const authMW = require("./../middlewares/authMw");

const router = express.Router();

const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    const destinationPath = path.join(__dirname, '..', 'uploads', 'category');
    callback(null, destinationPath);
  },
  filename: (req, file, callback) => {
    callback(null, file.originalname);
  },
});

// const storage = multer.diskStorage({
//   destination: (req, file, callback) => {
//     callback(null, "./uploads/category/");
//   },
//   filename: (req, file, callback) => {
//     callback(null, file.originalname);
//   },
// });

const filter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg"
  ) {
    cb(null, true);
    console.log("File passed filter:", true);
  } else {
    cb(null, false);
    console.log("File failed filter:", false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 },
  fileFilter: filter,
});

router
  .route("/categories")
  .get(controller.getAllCategory)
  .post(
    authMW.verifyToken,
    authMW.isAdmin,
    (req, res, next) => {
      console.log("Before upload.single middleware");
      upload.single("image")(req, res, (err) => {
        if (err) {
          console.error("Error in upload.single middleware:", err);
          return res.status(400).json({ error: "File upload failed." });
        }
        console.log("After upload.single middleware");
        next();
      });
    },
    validations.postValidation,
    validator,
    controller.addCategory
  )
  .patch(
    authMW.verifyToken,
    authMW.isAdmin,
    upload.single("image"),
    validations.updateValidation,
    validator,
    controller.updateCategory
  )
  .delete(
    authMW.verifyToken,
    authMW.isAdmin,
    validations.deleteValidation,
    validator,
    controller.deleteCategory
  );

router
  .route("/categories/search")
  .get(validations.searchValidation, validator, controller.searchForCategory);

router
  .route("/categories/:id")
  .get(validations.idValidation, validator, controller.getCategoryById);

module.exports = router;