import mongoose, { Schema, Document } from "mongoose";

export interface IAttendance extends Document {
  attendanceId: string;
  memberId: mongoose.Types.ObjectId;
  classId?: mongoose.Types.ObjectId;
  date: Date;
  status: "PRESENT" | "ABSENT" | "LATE";
  markedBy?: mongoose.Types.ObjectId; // User/Admin id
  gymId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSchema = new Schema<IAttendance>(
  {
    attendanceId: {
      type: String,
      unique: true,
      required: true,
    },
    memberId: {
      type: Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },
    classId: {
      type: Schema.Types.ObjectId,
      ref: "ClassSchedule",
    },
    date: {
      type: Date,
      default: Date.now,
      required: true,
    },
    status: {
      type: String,
      enum: ["PRESENT", "ABSENT", "LATE"],
      required: true,
      default: "PRESENT",
    },
    markedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    gymId: {
      type: Schema.Types.ObjectId,
      ref: "Gym",
      required: true,
    },
  },
  { timestamps: true }
);

export const Attendance = mongoose.model<IAttendance>("Attendance", AttendanceSchema);
