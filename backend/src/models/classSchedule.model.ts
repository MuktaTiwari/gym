import mongoose, { Schema, Document } from "mongoose";

export interface IClassSchedule extends Document {
  className: string;
  trainerName: string;
  time: string; // e.g. "07:00 AM"
  capacity: number;
  bookedCount: number;
  status: "ACTIVE" | "CANCELLED" | "CLOSED";
  gymId: mongoose.Types.ObjectId;
}

const ClassScheduleSchema: Schema = new Schema(
  {
    className: { type: String, required: true },
    trainerName: { type: String, required: true },
    time: { type: String, required: true },
    capacity: { type: Number, required: true, default: 20 },
    bookedCount: { type: Number, required: true, default: 0 },
    status: {
      type: String,
      enum: ["ACTIVE", "CANCELLED", "CLOSED"],
      default: "ACTIVE",
    },
    gymId: { type: Schema.Types.ObjectId, ref: "Gym", required: true },
  },
  { timestamps: true }
);

export const ClassSchedule = mongoose.model<IClassSchedule>("ClassSchedule", ClassScheduleSchema);
