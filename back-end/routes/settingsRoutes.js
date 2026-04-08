const express = require("express");
const router = express.Router();

const {
  changeDisplayName,
  changeEmail,
  changePassword,
  deleteAccount,
  getNotificationSettings,
  updateNotificationSettings,
} = require("../controllers/settingsController");

router.put("/display-name", changeDisplayName);
router.put("/email", changeEmail);
router.put("/password", changePassword);
router.delete("/account", deleteAccount);
router.get("/notifications", getNotificationSettings);
router.put("/notifications", updateNotificationSettings);

module.exports = router;