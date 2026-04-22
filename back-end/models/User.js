const mongoose = require("mongoose");

const availabilitySchema = new mongoose.Schema(
  {
    day: {
      type: String,
      trim: true,
    },
    slots: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  { _id: false }
);

const onboardingSchema = new mongoose.Schema(
  {
    goal: {
      type: String,
      trim: true,
      default: "",
    },
    focusTags: [
      {
        type: String,
        trim: true,
      },
    ],
    companyTarget: {
      type: String,
      trim: true,
      default: "",
    },
    sessionType: {
      type: String,
      trim: true,
      default: "",
    },
    weakestArea: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 80,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    passwordHash: {
      type: String,
      required: true,
    },

    bio: {
      type: String,
      trim: true,
      default: "",
    },

    role: {
      type: String,
      trim: true,
      default: "",
    },

    level: {
      type: String,
      trim: true,
      default: "",
    },

    avatar: {
      type: String,
      trim: true,
      default: "",
    },

    linkedinUrl: {
      type: String,
      trim: true,
      default: "",
    },

    completedSessions: {
      type: Number,
      default: 0,
      min: 0,
    },

    showUpRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    isNewUser: {
      type: Boolean,
      default: true,
    },

    onboarding: {
      type: onboardingSchema,
      default: () => ({}),
    },

    availability: {
      type: [availabilitySchema],
      default: [],
    },

    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);