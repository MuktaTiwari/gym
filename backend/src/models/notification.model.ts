import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
  notificationId: string;
  recipientId: mongoose.Types.ObjectId;
  recipientType: "MEMBER" | "ADMIN";
  message: string;
  type: "INFO" | "ALERT" | "BOOKING" | "PAYMENT" | "TRAINER" | "ANNOUNCEMENT";
  isRead: boolean;
  triggeredBy?: mongoose.Types.ObjectId;
  gymId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    notificationId: {
      type: String,
      unique: true,
      required: true,
    },
    recipientId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    recipientType: {
      type: String,
      enum: ["MEMBER", "ADMIN"],
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["INFO", "ALERT", "BOOKING", "PAYMENT", "TRAINER", "ANNOUNCEMENT"],
      default: "INFO",
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      required: true,
    },
    triggeredBy: {
      type: Schema.Types.ObjectId,
    },
    gymId: {
      type: Schema.Types.ObjectId,
      ref: "Gym",
      required: true,
    },
  },
  { timestamps: true }
);

export const Notification = mongoose.model<INotification>("Notification", NotificationSchema);
