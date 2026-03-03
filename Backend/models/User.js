import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String }, // null for OAuth users
    role: {
      type: String,
      enum: ["user", "admin", "superadmin"],
      default: "user",
    },
    googleId: { type: String },
    resetPasswordToken: { type: String },
    resetPasswordExpiry: { type: Date },
  },
  { timestamps: true },
);

userSchema.pre("save", async function () {
  if (this.isModified("password") && this.password) {
    this.password = await bcrypt.hash(
      this.password,
      Number(process.env.BCRYPT_ROUNDS) || 12,
    );
  }
});

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

userSchema.methods.toSafeObject = function () {
  const { _id, name, email, role, createdAt } = this;
  return { id: _id, name, email, role, createdAt };
};

export default mongoose.model("User", userSchema);
