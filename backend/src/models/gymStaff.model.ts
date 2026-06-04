import mongoose, { Schema, Document } from "mongoose";
import { Role } from "../enums/roles.enum";

export interface IGymStaff extends Document {
  gymId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

const GymStaffSchema = new Schema<IGymStaff>(
  {
    gymId: { type: Schema.Types.ObjectId, ref: "Gym", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: Object.values(Role), required: true },
  },
  { timestamps: true }
);

// A user can have only one role in a specific gym
GymStaffSchema.index({ gymId: 1, userId: 1 }, { unique: true });

export const GymStaff = mongoose.model<IGymStaff>("GymStaff", GymStaffSchema);
