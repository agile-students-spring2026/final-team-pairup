const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { randomUUID } = require('crypto');
const User = require('../models/User');
const { connectToDatabase } = require('../modules/db');

const JWT_SECRET = process.env.JWT_SECRET || 'pairup_secret_key';

const registerUser = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    await connectToDatabase();

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail }).lean();

    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const now = new Date();

    const newUser = await User.create({
      _id: randomUUID(),
      email: normalizedEmail,
      passwordHash,
      displayName: fullName.trim(),
      role: null,
      practiceFocus: [],
      targetTier: null,
      timeline: null,
      level: null,
      weakestArea: null,
      background: null,
      school: null,
      bio: null,
      linkedinUrl: null,
      availability: null,
      whoGoesFirst: null,
      feedbackStyle: null,
      timezone: 'America/New_York',
      sessionsCompleted: 0,
      showUpRate: 1.0,
      activePartnerships: 0,
      totalPartnerships: 0,
      pendingReceivedInvites: 0,
      inviteResponseRate: 1.0,
      notifications: {
        inviteReceived: true,
        matchConfirmed: true,
        sessionReminder: true,
      },
      createdAt: now,
      updatedAt: now,
    });

    return res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser._id,
        fullName: newUser.displayName,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    await connectToDatabase();

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        fullName: user.displayName,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const forgotPassword = (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  return res.status(200).json({ message: 'Reset link sent' });
};

module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
};