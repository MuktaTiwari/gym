import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcrypt";
import { MembershipStatus } from "../enums/membershipStatus.enum";

export interface IMember extends Document {
  memberId: string;
  fullName: string;
  email: string;
  phone?: string;
  password?: string;
  gymId: mongoose.Types.ObjectId;
  status: MembershipStatus;
  planId?: mongoose.Types.ObjectId;
  membershipPlan?: string;
  membershipStartDate: Date;
  membershipEndDate?: Date;
  assignedTrainer?: string;
  assignedTrainerId?: mongoose.Types.ObjectId;
  membershipCardId?: string;
  profilePhoto?: string;
  weight?: number; // in kg
  height?: number; // in cm
  age?: number;
  gender?: "MALE" | "FEMALE" | "OTHER";
  emergencyContact?: {
    name: string;
    phone: string;
    relation: string;
  };
  attendanceCount: number;
  refreshToken?: string;
  notes?: Array<{ content: string; createdAt: Date; author: string }>;
  paymentHistory?: any[];
  bookingHistory?: any[];
  attendanceRecords?: any[];
  totalPaid?: number;
  comparePassword: (password: string) => Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

const MemberSchema = new Schema<IMember>(
  {
    memberId: {
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
    password: {
      type: String,
      required: true,
    },
    gymId: {
      type: Schema.Types.ObjectId,
      ref: "Gym",
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(MembershipStatus),
      default: MembershipStatus.ACTIVE,
      required: true,
    },
    planId: {
      type: Schema.Types.ObjectId,
      ref: "Plan",
    },
    membershipPlan: {
      type: String,
    },
    membershipStartDate: {
      type: Date,
      default: Date.now,
      required: true,
    },
    membershipEndDate: {
      type: Date,
    },
    assignedTrainer: {
      type: String,
    },
    assignedTrainerId: {
      type: Schema.Types.ObjectId,
      ref: "Trainer",
    },
    membershipCardId: {
      type: String,
    },
    profilePhoto: {
      type: String,
    },
    weight: {
      type: Number,
      min: 0,
    },
    height: {
      type: Number,
      min: 0,
    },
    age: {
      type: Number,
      min: 0,
    },
    gender: {
      type: String,
      enum: ["MALE", "FEMALE", "OTHER"],
    },
    emergencyContact: {
      name: { type: String, trim: true },
      phone: { type: String, trim: true },
      relation: { type: String, trim: true },
    },
    attendanceCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    refreshToken: {
      type: String,
    },
    notes: {
      type: [{
        content: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
        author: { type: String, default: "Admin" }
      }],
      default: [],
    },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

MemberSchema.virtual("paymentHistory", {
  ref: "Payment",
  localField: "_id",
  foreignField: "memberId",
});

MemberSchema.virtual("bookingHistory", {
  ref: "Booking",
  localField: "_id",
  foreignField: "memberId",
});

MemberSchema.virtual("attendanceRecords", {
  ref: "Attendance",
  localField: "_id",
  foreignField: "memberId",
});

MemberSchema.virtual("totalPaid").get(function(this: any) {
  if (!this.paymentHistory) return 0;
  return this.paymentHistory
    .filter((p: any) => p.status === "COMPLETED")
    .reduce((sum: number, p: any) => sum + p.amount, 0);
});

MemberSchema.pre<IMember>("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password || "", salt);
    next();
  } catch (err: any) {
    next(err);
  }
});

MemberSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password || "");
};

export const Member = mongoose.model<IMember>("Member", MemberSchema);
