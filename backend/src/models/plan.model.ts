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
  },
  { timestamps: true }
);

export const Plan = mongoose.model<IPlan>("Plan", PlanSchema);
