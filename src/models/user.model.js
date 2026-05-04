import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    dob: { type: Date },
    gender: { type: String, enum: ["male", "female", "other", "prefer-not-to-say"] },
    profileUrl: { type: String, default: "" },

    // Security & Status
    isVerified: { type: Boolean, default: false },
    isDeletedAccount: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    isSuspended: { type: Boolean, default: false },
    suspensionEndsAt: { type: Date },
    lastLogin: { type: Date },
    role: { type: String, enum: ["admin", "user"], default: "user" },

    // Notifications with Multi-Device Support
    isNotificationEnabled: { type: Boolean, default: true },
    fcmToken: [
      {
        token: { type: String },
        deviceType: { type: String },
        lastUsed: { type: Date, default: Date.now }
      }
    ],

    otp: {
      code: { type: String },
      expiresAt: { type: Date },
    },
  },
  { timestamps: true }
);

const sanitizeUserForClient = (_doc, ret) => {
  delete ret.password;
  delete ret.otp;
  return ret;
};

userSchema.set("toJSON", { transform: sanitizeUserForClient });
userSchema.set("toObject", { transform: sanitizeUserForClient });

// Hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model("User", userSchema);