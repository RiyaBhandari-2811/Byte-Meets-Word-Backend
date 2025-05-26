import mongoose, { Schema, Model } from "mongoose";
import { ISubscriber } from "../types/subscriber";

const SubscriberSchema: Schema<ISubscriber> = new Schema<ISubscriber>(
  {
    email: { type: String, required: true },
    verified: { type: Boolean, default: false },
    verifyToken: { type: String },
    verifyTokenExpiry: { type: Date },
    unsubToken: { type: String },
    unsubTokenExpiry: { type: Date },
  },
  {
    timestamps: true,
  }
);

const Subscriber: Model<ISubscriber> = mongoose.model<ISubscriber>(
  "Subscriber",
  SubscriberSchema
);
export default Subscriber;
