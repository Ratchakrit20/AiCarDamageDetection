import mongoose, { Schema, model, models } from "mongoose";

const userInsuranceRequestSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  policy_number: {
    type: String,
    required: true,
    unique: true,
  },
  insurance_type: {
    type: String,
    enum: ["Full Coverage", "Third Party", "Other"],
    required: true,
  },
  policy_start_date: {
    type: Date,
    required: true,
  },
  policy_end_date: {
    type: Date,
    required: true,
  },
  car_brand: { type: String, required: true },
  car_model: { type: String, required: true },
  car_year: { type: Number, required: true },
  license_plate: { type: String, required: true },
  claim_limit: { type: Number, required: true },
  coverage_details: { type: String },

  // ✅ Status Control
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  rejection_reason: {
    type: String, // ใส่เฉพาะตอนถูกปฏิเสธ
  },
}, { timestamps: true });

const UserInsuranceRequest = models.UserInsuranceRequest || model("UserInsuranceRequest", userInsuranceRequestSchema);
export default UserInsuranceRequest;
