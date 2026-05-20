import mongoose, { Schema, Document } from "mongoose";

export interface IWorkout extends Document {
  memberId: mongoose.Types.ObjectId;
  gymId: mongoose.Types.ObjectId;
  title: string;
  duration: number; // in minutes
  exercises: Array<{
    name: string;
    sets: number;
    reps: number;
    weight?: number; // in kg/lbs
  }>;
  notes?: string;
  date: Date;
}

const WorkoutSchema: Schema = new Schema(
  {
    memberId: { type: Schema.Types.ObjectId, ref: "Member", required: true },
    gymId: { type: Schema.Types.ObjectId, ref: "Gym", required: true },
    title: { type: String, required: true },
    duration: { type: Number, required: true },
    exercises: [
      {
        name: { type: String, required: true },
        sets: { type: Number, required: true },
        reps: { type: Number, required: true },
        weight: { type: Number },
      },
    ],
    notes: { type: String },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Workout = mongoose.model<IWorkout>("Workout", WorkoutSchema);
