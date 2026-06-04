import mongoose, { Schema, Document } from "mongoose";

export interface IGymSettings {
  theme?: "light" | "dark" | "system";
  primaryColor?: string;
  fontStyle?: "default" | "modern" | "classic";
}

export interface IGym extends Document {
  name: string;
  ownerId: mongoose.Types.ObjectId;
  address?: string;
  city?: string;
  country?: string;
  phone?: string;
  email?: string;
  logo?: string;
  settings?: IGymSettings;
  status: "ACTIVE" | "OVERDUE" | "SUSPENDED";
  plan: "Standard" | "Premium" | "Enterprise";
  createdAt: Date;
  updatedAt: Date;
}

const GymSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
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
    status: { type: String, enum: ["ACTIVE", "OVERDUE", "SUSPENDED"], default: "ACTIVE" },
    plan: { type: String, enum: ["Standard", "Premium", "Enterprise"], default: "Standard" }
  },
  { timestamps: true }
);

export const Gym = mongoose.model<IGym>("Gym", GymSchema);
