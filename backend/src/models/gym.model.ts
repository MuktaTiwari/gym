import mongoose, { Schema, Document } from "mongoose";

export interface IGymSettings {
  theme?: "light" | "dark" | "system";
  primaryColor?: string;
  fontStyle?: "default" | "modern" | "classic";
}

export interface IGym extends Document {
  name: string;
  address?: string;
  city?: string;
  country?: string;
  phone?: string;
  email?: string;
  logo?: string;
  settings?: IGymSettings;
  createdAt: Date;
  updatedAt: Date;
}

const GymSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, trim: true },
    city: { type: String, trim: true },
    country: { type: String, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, trim: true },
    logo: { type: String },
    settings: {
      theme: { type: String, enum: ["light", "dark", "system"], default: "system" },
      primaryColor: { type: String },
      fontStyle: { type: String, enum: ["default", "modern", "classic"], default: "default" },
    },
  },
  { timestamps: true }
);

export const Gym = mongoose.model<IGym>("Gym", GymSchema);
