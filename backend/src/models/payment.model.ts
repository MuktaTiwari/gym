import mongoose, { Schema, Document } from "mongoose";

export interface IPayment extends Document {
  memberId: mongoose.Types.ObjectId;
  gymId: mongoose.Types.ObjectId;
  planName: string;
  amount: number;
  method: "CREDIT_CARD" | "BANK_TRANSFER" | "CASH" | "STRIPE";
  status: "COMPLETED" | "PENDING" | "FAILED" | "OVERDUE" | "REFUNDED";
  date: Date;
}

const PaymentSchema: Schema = new Schema(
  {
    memberId: { type: Schema.Types.ObjectId, ref: "Member", required: true },
    gymId: { type: Schema.Types.ObjectId, ref: "Gym", required: true },
    planName: { type: String, required: true },
    amount: { type: Number, required: true },
    method: {
      type: String,
      enum: ["CREDIT_CARD", "BANK_TRANSFER", "CASH", "STRIPE"],
      required: true,
    },
    status: {
      type: String,
      enum: ["COMPLETED", "PENDING", "FAILED", "OVERDUE", "REFUNDED"],
      default: "COMPLETED",
    },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Payment = mongoose.model<IPayment>("Payment", PaymentSchema);
