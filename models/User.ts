import mongoose, { Schema, Model } from "mongoose";
import { IUser } from "../types/user";
import bcrypt from "bcrypt";

const UserSchema: Schema<IUser> = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 8 },
  role: { type: String, default: "user", enum: ["user", "admin"] },
  createdAt: { type: Date, default: Date.now },
  modifiedAt: { type: Date, default: Date.now },
});

UserSchema.pre<IUser>("save", async function (next) {
  try {
    if (!this.isModified("password")) return next();

    const salt: string = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});


const User: Model<IUser> = mongoose.model<IUser>("User", UserSchema);

export default User;
