const express = require("express");
const { body, validationResult } = require("express-validator");
const router = express.Router();

const {
  changeDisplayName,
  changeEmail,
  changePassword,
  deleteAccount,
  getNotificationSettings,
  updateNotificationSettings,
} = require("../controllers/settingsController");

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

const displayNameValidators = [
  body("newDisplayName")
    .isString()
    .withMessage("newDisplayName must be a string.")
    .trim()
    .notEmpty()
    .withMessage("newDisplayName is required.")
    .isLength({ max: 50 })
    .withMessage("newDisplayName must be 50 characters or fewer."),
  validationErrors,
];

const emailValidators = [
  body("currentPassword")
    .isString()
    .withMessage("currentPassword must be a string.")
    .notEmpty()
    .withMessage("currentPassword is required."),
  body("newEmail")
    .isEmail()
    .withMessage("newEmail must be a valid email address.")
    .normalizeEmail(),
  validationErrors,
];

const passwordValidators = [
  body("currentPassword")
    .isString()
    .withMessage("currentPassword must be a string.")
    .notEmpty()
    .withMessage("currentPassword is required."),
  body("newPassword")
    .isString()
    .withMessage("newPassword must be a string.")
    .isLength({ min: 8 })
    .withMessage("newPassword must be at least 8 characters long."),
  validationErrors,
];

const deleteAccountValidators = [
  body("currentPassword")
    .isString()
    .withMessage("currentPassword must be a string.")
    .notEmpty()
    .withMessage("currentPassword is required."),
  validationErrors,
];

const updateNotificationsValidators = [
  body("notifications")
    .isObject()
    .withMessage("notifications must be an object."),
  body("notifications.newInvitationReceived")
    .optional()
    .isBoolean()
    .withMessage("notifications.newInvitationReceived must be a boolean."),
  body("notifications.inviteAccepted")
    .optional()
    .isBoolean()
    .withMessage("notifications.inviteAccepted must be a boolean."),
  body("notifications.sessionReminder")
    .optional()
    .isBoolean()
    .withMessage("notifications.sessionReminder must be a boolean."),
  body("notifications.sessionBookingConfirmation")
    .optional()
    .isBoolean()
    .withMessage("notifications.sessionBookingConfirmation must be a boolean."),
  validationErrors,
];

router.put("/display-name", displayNameValidators, changeDisplayName);
router.put("/email", emailValidators, changeEmail);
router.put("/password", passwordValidators, changePassword);
router.delete("/account", deleteAccountValidators, deleteAccount);
router.get("/notifications", getNotificationSettings);
router.put("/notifications", updateNotificationsValidators, updateNotificationSettings);

module.exports = router;