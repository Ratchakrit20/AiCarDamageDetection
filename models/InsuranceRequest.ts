import mongoose, { Schema, model, models, Document } from "mongoose";

export interface IInsuranceRequest extends Document {
  user_id: mongoose.Types.ObjectId;
  customer_ins: mongoose.Types.ObjectId; // เปลี่ยนจาก number เป็น ObjectId
  status: "pending" | "approved" | "rejected";
  rejection_reason?: string;
  requested_at: Date;
}

const insuranceRequestSchema = new Schema<IInsuranceRequest>({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  customer_ins: {
    type: Schema.Types.ObjectId,
    ref: "CustomerInsurance", // ต้องตรงกับชื่อโมเดลของ customer insurance
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  rejection_reason: {
    type: String,
  },
  requested_at: {
    type: Date,
    default: Date.now,
  },
});

const InsuranceRequest =
  models.InsuranceRequest || model<IInsuranceRequest>("InsuranceRequest", insuranceRequestSchema);

export default InsuranceRequest;
