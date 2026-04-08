const bcrypt = require("bcrypt");
const users = require("../data/users");

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

const changeDisplayName = (req, res) => {
  const { email, newDisplayName } = req.body;

  const user = users.find((u) => u.email === email);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (!newDisplayName || !newDisplayName.trim()) {
    return res.status(400).json({ message: "New display name is required" });
  }

  // Unified schema uses displayName
  user.displayName = newDisplayName.trim();
  user.updatedAt = new Date().toISOString();

  res.status(200).json({
    message: "Display name updated successfully",
    user: toSettingsUser(user),
  });
};

const changeEmail = async (req, res) => {
  const { currentEmail, currentPassword, newEmail } = req.body;

  const user = users.find((u) => u.email === currentEmail);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const emailTaken = users.find((u) => u.email === newEmail);
  if (emailTaken) {
    return res.status(400).json({ message: "New email is already in use" });
  }

  // Unified schema uses passwordHash
  const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isMatch) {
    return res.status(401).json({ message: "Incorrect current password" });
  }

  user.email = newEmail.trim().toLowerCase();
  user.updatedAt = new Date().toISOString();

  res.status(200).json({
    message: "Email updated successfully",
    user: toSettingsUser(user),
  });
};

const changePassword = async (req, res) => {
  const { email, currentPassword, newPassword } = req.body;

  const user = users.find((u) => u.email === email);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isMatch) {
    return res.status(401).json({ message: "Incorrect current password" });
  }

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  user.updatedAt = new Date().toISOString();

  res.status(200).json({ message: "Password updated successfully" });
};

const deleteAccount = async (req, res) => {
  const { email, currentPassword } = req.body;

  const userIndex = users.findIndex((u) => u.email === email);
  if (userIndex === -1) {
    return res.status(404).json({ message: "User not found" });
  }

  const user = users[userIndex];
  const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isMatch) {
    return res.status(401).json({ message: "Incorrect current password" });
  }

  users.splice(userIndex, 1);

  res.status(200).json({ message: "Account deleted successfully" });
};

const getNotificationSettings = (req, res) => {
  const { email } = req.query;

  const user = users.find((u) => u.email === email);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Seed missing notifications block (covers legacy mock users)
  if (!user.notifications) {
    user.notifications = {
      newInvitationReceived: true,
      inviteAccepted: true,
      sessionReminder: true,
      sessionBookingConfirmation: true,
    };
  }

  // The unified schema stores keys as { inviteReceived, matchConfirmed, sessionReminder }.
  // The front-end SettingsPage expects { newInvitationReceived, inviteAccepted, sessionReminder, sessionBookingConfirmation }.
  // Normalise outbound so both sides stay happy.
  const n = user.notifications;
  res.status(200).json({
    newInvitationReceived: n.newInvitationReceived ?? n.inviteReceived ?? true,
    inviteAccepted:        n.inviteAccepted        ?? n.matchConfirmed ?? true,
    sessionReminder:       n.sessionReminder       ?? true,
    sessionBookingConfirmation: n.sessionBookingConfirmation ?? true,
  });
};

const updateNotificationSettings = (req, res) => {
  const { email, notifications } = req.body;

  const user = users.find((u) => u.email === email);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  user.notifications = {
    ...user.notifications,
    ...notifications,
  };
  user.updatedAt = new Date().toISOString();

  const n = user.notifications;
  res.status(200).json({
    message: "Notification settings updated successfully",
    notifications: {
      newInvitationReceived: n.newInvitationReceived ?? n.inviteReceived ?? true,
      inviteAccepted:        n.inviteAccepted        ?? n.matchConfirmed ?? true,
      sessionReminder:       n.sessionReminder       ?? true,
      sessionBookingConfirmation: n.sessionBookingConfirmation ?? true,
    },
  });
};

module.exports = {
  changeDisplayName,
  changeEmail,
  changePassword,
  deleteAccount,
  getNotificationSettings,
  updateNotificationSettings,
};