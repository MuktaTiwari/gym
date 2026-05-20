import mongoose, { Schema, Document } from "mongoose";

export interface ITrainerChangeRequest extends Document {
  requestId: string;
  memberId: mongoose.Types.ObjectId;
  currentTrainerId?: mongoose.Types.ObjectId;
  requestedTrainerId: mongoose.Types.ObjectId;
  reason?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  gymId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TrainerChangeRequestSchema = new Schema<ITrainerChangeRequest>(
  {
    requestId: {
      type: String,
      unique: true,
      required: true,
    },
    memberId: {
      type: Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },
    currentTrainerId: {
      type: Schema.Types.ObjectId,
      ref: "Trainer",
    },
    requestedTrainerId: {
      type: Schema.Types.ObjectId,
      ref: "Trainer",
      required: true,
    },
    reason: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
      required: true,
    },
    gymId: {
      type: Schema.Types.ObjectId,
      ref: "Gym",
      required: true,
    },
  },
  { timestamps: true }
);

export const TrainerChangeRequest = mongoose.model<ITrainerChangeRequest>("TrainerChangeRequest", TrainerChangeRequestSchema);
