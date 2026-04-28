const express = require("express");
const { body, validationResult } = require("express-validator");
const router = express.Router();

const {
  registerUser,
  loginUser,
  forgotPassword,
} = require("../controllers/authController");

function validationErrors(req, res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) {
    return next();
  }

  return res.status(400).json({
    error: "Validation failed",
    details: result.array().map((item) => item.msg),
  });
}

const registerValidators = [
  body("fullName")
    .isString()
    .withMessage("fullName must be a string.")
    .trim()
    .notEmpty()
    .withMessage("fullName is required.")
    .isLength({ max: 50 })
    .withMessage("fullName must be 50 characters or fewer."),
  body("email")
    .isEmail()
    .withMessage("email must be a valid email address.")
    .normalizeEmail(),
  body("password")
    .isString()
    .withMessage("password must be a string.")
    .isLength({ min: 8 })
    .withMessage("password must be at least 8 characters long."),
  validationErrors,
];

const loginValidators = [
  body("email")
    .isEmail()
    .withMessage("email must be a valid email address.")
    .normalizeEmail(),
  body("password")
    .isString()
    .withMessage("password must be a string.")
    .notEmpty()
    .withMessage("password is required."),
  validationErrors,
];

const forgotPasswordValidators = [
  body("email")
    .isEmail()
    .withMessage("email must be a valid email address.")
    .normalizeEmail(),
  validationErrors,
];

router.post("/register", registerValidators, registerUser);
router.post("/login", loginValidators, loginUser);
router.post("/forgot-password", forgotPasswordValidators, forgotPassword);

module.exports = router;