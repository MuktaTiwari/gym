import mongoose, { Schema, Document } from "mongoose";

export interface IActivityLog extends Document {
  memberId: mongoose.Types.ObjectId;
  action: string; // e.g. "CLASS_BOOKED", "PAYMENT_MADE", "PROFILE_UPDATED", "CHECK_IN"
  timestamp: Date;
  triggeredBy: "MEMBER" | "ADMIN";
  details?: string;
  gymId: mongoose.Types.ObjectId;
}

const ActivityLogSchema: Schema = new Schema(
  {
    memberId: { type: Schema.Types.ObjectId, ref: "Member", required: true },
    action: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    triggeredBy: {
      type: String,
      enum: ["MEMBER", "ADMIN"],
      required: true,
    },
    details: { type: String },
    gymId: { type: Schema.Types.ObjectId, ref: "Gym", required: true },
  },
  { timestamps: true }
);

export const ActivityLog = mongoose.model<IActivityLog>("ActivityLog", ActivityLogSchema);
