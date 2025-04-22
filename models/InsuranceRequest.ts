import mongoose, { Schema, model } from "mongoose";

const InsuranceRequestSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  policy_number: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  request_date: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
});


const models = mongoose.connection.models as Record<string, any>;
delete models["InsuranceRequest"];


export default mongoose.models.InsuranceRequest ||
  model("InsuranceRequest", InsuranceRequestSchema);
