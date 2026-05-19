import mongoose, { Schema, Document } from "mongoose";

export interface IGym extends Document {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  createdAt: Date;
  updatedAt: Date;
}

const GymSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, trim: true },
  },
  { timestamps: true }
);

export const Gym = mongoose.model<IGym>("Gym", GymSchema);
