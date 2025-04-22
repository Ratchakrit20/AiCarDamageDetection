import mongoose, { Schema, model } from "mongoose";

const InsuranceRequestSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  policy_number: { type: String, required: true },
  request_date: { type: Date, default: Date.now },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
});

export default mongoose.models.InsuranceRequest  || model("InsuranceRequest", InsuranceRequestSchema);
