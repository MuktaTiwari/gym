import mongoose, { Schema, Document } from "mongoose";

export interface IBooking extends Document {
  memberId: mongoose.Types.ObjectId;
  classId?: mongoose.Types.ObjectId; // References ClassSchedule
  gymId: mongoose.Types.ObjectId;
  className: string;
  trainerName: string;
  time: string;
  date: Date;
  bookingDate: Date;
  status: "BOOKED" | "ATTENDED" | "CANCELLED";
}

const BookingSchema: Schema = new Schema(
  {
    memberId: { type: Schema.Types.ObjectId, ref: "Member", required: true },
    classId: { type: Schema.Types.ObjectId, ref: "ClassSchedule" },
    gymId: { type: Schema.Types.ObjectId, ref: "Gym", required: true },
    className: { type: String, required: true },
    trainerName: { type: String, required: true },
    time: { type: String, required: true },
    date: { type: Date, required: true },
    bookingDate: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["BOOKED", "ATTENDED", "CANCELLED"],
      default: "BOOKED",
    },
  },
  { timestamps: true }
);

export const Booking = mongoose.model<IBooking>("Booking", BookingSchema);
