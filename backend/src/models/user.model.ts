import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcrypt";
import { Role } from "../enums/roles.enum";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: Role;
  gymId?: mongoose.Types.ObjectId;
  refreshToken?: string;
  comparePassword: (password: string) => Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    role: {
      type: String,
      required: true,
      enum: Object.values(Role),
      default: Role.MEMBER,
    },
    gymId: { type: Schema.Types.ObjectId, ref: "Gym" },
    refreshToken: { type: String },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

UserSchema.virtual("memberProfile", {
  ref: "Member",
  localField: "_id",
  foreignField: "userId",
  justOne: true,
});

UserSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password || "", salt);
    next();
  } catch (err: any) {
    next(err);
  }
});

UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password || "");
};

export const User = mongoose.model<IUser>("User", UserSchema);
