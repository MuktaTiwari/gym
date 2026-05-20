import mongoose, { Schema, Document } from "mongoose";

export interface ITrainer extends Document {
  trainerId: string;
  fullName: string;
  email: string;
  phone?: string;
  photo?: string;
  specialization?: string;
  assignedMembers: mongoose.Types.ObjectId[];
  schedule: {
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
  };
  gymId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TrainerSchema = new Schema<ITrainer>(
  {
    trainerId: {
      type: String,
      unique: true,
      required: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    photo: {
      type: String,
    },
    specialization: {
      type: String,
      trim: true,
    },
    assignedMembers: [
      {
        type: Schema.Types.ObjectId,
        ref: "Member",
      },
    ],
    schedule: {
      monday: { type: String, default: "09:00 AM - 05:00 PM" },
      tuesday: { type: String, default: "09:00 AM - 05:00 PM" },
      wednesday: { type: String, default: "09:00 AM - 05:00 PM" },
      thursday: { type: String, default: "09:00 AM - 05:00 PM" },
      friday: { type: String, default: "09:00 AM - 05:00 PM" },
      saturday: { type: String, default: "10:00 AM - 02:00 PM" },
      sunday: { type: String, default: "Off" },
    },
    gymId: {
      type: Schema.Types.ObjectId,
      ref: "Gym",
      required: true,
    },
  },
  { timestamps: true }
);

export const Trainer = mongoose.model<ITrainer>("Trainer", TrainerSchema);
