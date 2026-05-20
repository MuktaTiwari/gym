import mongoose, { Schema, Document } from "mongoose";
import { PlanType } from "../enums/planType.enum";

export interface IPlan extends Document {
  gymId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  price: number;
  durationInMonths: number;
  type: PlanType;
  isActive: boolean;
  isPopular: boolean;
  features: string[];
  maxMembers?: number;
  discountPercentage?: number;
  accessHours?: string;
  trainerSessionsIncluded?: number;
  guestPassesPerMonth?: number;
  createdAt: Date;
  updatedAt: Date;
}

const PlanSchema = new Schema<IPlan>(
  {
    gymId: {
      type: Schema.Types.ObjectId,
      ref: "Gym",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    durationInMonths: {
      type: Number,
      required: true,
      min: 1,
    },
    type: {
      type: String,
      enum: Object.values(PlanType),
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isPopular: {
      type: Boolean,
      default: false,
    },
    features: {
      type: [String],
      default: [],
    },
    maxMembers: {
      type: Number,
      default: null,
    },
    discountPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    accessHours: {
      type: String,
      default: "All Hours",
    },
    trainerSessionsIncluded: {
      type: Number,
      default: 0,
    },
    guestPassesPerMonth: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export const Plan = mongoose.model<IPlan>("Plan", PlanSchema);
