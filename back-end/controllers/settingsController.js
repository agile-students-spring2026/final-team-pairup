const bcrypt = require("bcrypt");
const users = require("../data/users");

const changeDisplayName = (req, res) => {
  const { email, newDisplayName } = req.body;

  const user = users.find((user) => user.email === email);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (!newDisplayName) {
    return res.status(400).json({ message: "New display name is required" });
  }

  user.fullName = newDisplayName;

  res.status(200).json({
    message: "Display name updated successfully",
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
    },
  });
};

const changeEmail = async (req, res) => {
  const { currentEmail, currentPassword, newEmail } = req.body;

  const user = users.find((user) => user.email === currentEmail);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const emailTaken = users.find((user) => user.email === newEmail);
  if (emailTaken) {
    return res.status(400).json({ message: "New email is already in use" });
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: "Incorrect current password" });
  }

  user.email = newEmail;

  res.status(200).json({
    message: "Email updated successfully",
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
    },
  });
};

const changePassword = async (req, res) => {
  const { email, currentPassword, newPassword } = req.body;

  const user = users.find((user) => user.email === email);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: "Incorrect current password" });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;

  res.status(200).json({ message: "Password updated successfully" });
};

const deleteAccount = async (req, res) => {
  const { email, currentPassword } = req.body;

  const userIndex = users.findIndex((user) => user.email === email);
  if (userIndex === -1) {
    return res.status(404).json({ message: "User not found" });
  }

  const user = users[userIndex];
  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: "Incorrect current password" });
  }

  users.splice(userIndex, 1);

  res.status(200).json({ message: "Account deleted successfully" });
};

const getNotificationSettings = (req, res) => {
  const { email } = req.query;

  const user = users.find((user) => user.email === email);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (!user.notifications) {
    user.notifications = {
      newInvitationReceived: true,
      inviteAccepted: true,
      sessionReminder: true,
      sessionBookingConfirmation: true,
    };
  }

  res.status(200).json(user.notifications);
};

const updateNotificationSettings = (req, res) => {
  const { email, notifications } = req.body;

  const user = users.find((user) => user.email === email);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  user.notifications = {
    ...user.notifications,
    ...notifications,
  };

  res.status(200).json({
    message: "Notification settings updated successfully",
    notifications: user.notifications,
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