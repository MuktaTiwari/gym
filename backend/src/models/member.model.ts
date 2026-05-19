import mongoose, { Schema, Document } from "mongoose";
import { MembershipStatus } from "../enums/membershipStatus.enum";

export interface IMember extends Document {
  userId: mongoose.Types.ObjectId;
  gymId: mongoose.Types.ObjectId;
  status: MembershipStatus;
  planId?: mongoose.Types.ObjectId;
  joinDate: Date;
  endDate?: Date;
  weight?: number; // in kg
  height?: number; // in cm
  age?: number;
  gender?: "MALE" | "FEMALE" | "OTHER";
  emergencyContact?: {
    name: string;
    phone: string;
    relation: string;
  };
  attendanceCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const MemberSchema = new Schema<IMember>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    gymId: {
      type: Schema.Types.ObjectId,
      ref: "Gym",
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(MembershipStatus),
      default: MembershipStatus.ACTIVE,
      required: true,
    },
    planId: {
      type: Schema.Types.ObjectId,
      ref: "Plan",
    },
    joinDate: {
      type: Date,
      default: Date.now,
      required: true,
    },
    endDate: {
      type: Date,
    },
    weight: {
      type: Number,
      min: 0,
    },
    height: {
      type: Number,
      min: 0,
    },
    age: {
      type: Number,
      min: 0,
    },
    gender: {
      type: String,
      enum: ["MALE", "FEMALE", "OTHER"],
    },
    emergencyContact: {
      name: { type: String, trim: true },
      phone: { type: String, trim: true },
      relation: { type: String, trim: true },
    },
    attendanceCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

export const Member = mongoose.model<IMember>("Member", MemberSchema);
