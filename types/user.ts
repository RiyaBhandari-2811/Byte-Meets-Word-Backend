import { Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "viewer" | "admin";
  createdAt: Date;
  modifiedAt: Date;
}
