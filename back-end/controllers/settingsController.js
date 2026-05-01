const bcrypt = require("bcrypt");
const User = require("../models/User");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Safe public-ish shape returned to the front-end after a settings change.
 * Matches what the front-end SettingsPage expects: { id, fullName, email }.
 * We map _id → id and displayName → fullName for backwards compatibility
 * with the existing front-end response handlers.
 */
function toSettingsUser(user) {
  return {
    id: user._id,
    fullName: user.displayName,
    email: user.email,
  };
}

// ---------------------------------------------------------------------------
// Controllers
// ---------------------------------------------------------------------------

const changeDisplayName = async (req, res) => {
  try {
    const { newDisplayName } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) return res.status(404).json({ message: "User not found" });

    user.displayName = newDisplayName.trim();
    user.updatedAt = new Date();

    await user.save();

    res.status(200).json({
      message: "Display name updated successfully",
      user: toSettingsUser(user),
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const changeEmail = async (req, res) => {
  const { currentPassword, newEmail } = req.body;

  const user = await User.findById(req.user._id);

  if (!user) return res.status(404).json({ message: "User not found" });

  const emailTaken = await User.findOne({ email: newEmail });
  if (emailTaken) {
    return res.status(400).json({ message: "New email is already in use" });
  }

  const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isMatch) {
    return res.status(401).json({ message: "Incorrect password" });
  }

  user.email = newEmail.trim().toLowerCase();
  await user.save();

  res.status(200).json({
    message: "Email updated successfully",
    user: toSettingsUser(user),
  });
};

const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id);

  if (!user) return res.status(404).json({ message: "User not found" });

  const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isMatch) {
    return res.status(401).json({ message: "Incorrect password" });
  }

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  await user.save();

  res.status(200).json({ message: "Password updated successfully" });
};

const deleteAccount = async (req, res) => {
  const { currentPassword } = req.body;

  const user = await User.findById(req.user._id);

  if (!user) return res.status(404).json({ message: "User not found" });

  const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isMatch) {
    return res.status(401).json({ message: "Incorrect password" });
  }

  await User.findByIdAndDelete(user._id);

  res.status(200).json({ message: "Account deleted successfully" });
};

const getNotificationSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const n = user.notifications || {};
    return res.status(200).json({
      newInvitationReceived: n.newInvitationReceived ?? n.inviteReceived ?? true,
      inviteAccepted: n.inviteAccepted ?? n.matchConfirmed ?? true,
      sessionReminder: n.sessionReminder ?? true,
      sessionBookingConfirmation: n.sessionBookingConfirmation ?? true,
    });
  } catch (_err) {
    return res.status(500).json({ message: "Server error" });
  }
};

const updateNotificationSettings = async (req, res) => {
  try {
    const { notifications } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.notifications = {
      ...(user.notifications || {}),
      ...(notifications || {}),
    };
    user.updatedAt = new Date();
    await user.save();

    const n = user.notifications;
    return res.status(200).json({
      message: "Notification settings updated successfully",
      notifications: {
        newInvitationReceived: n.newInvitationReceived ?? n.inviteReceived ?? true,
        inviteAccepted: n.inviteAccepted ?? n.matchConfirmed ?? true,
        sessionReminder: n.sessionReminder ?? true,
        sessionBookingConfirmation: n.sessionBookingConfirmation ?? true,
      },
    });
  } catch (_err) {
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  changeDisplayName,
  changeEmail,
  changePassword,
  deleteAccount,
  getNotificationSettings,
  updateNotificationSettings,
};