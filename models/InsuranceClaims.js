import mongoose, { Schema, model, models } from "mongoose";

const insuranceClaimsSchema = new Schema(
    {
        claim_id: { type: Number, required: true, unique: true },
        estimate_id: { type: Schema.Types.ObjectId, ref: "PricingEstimates", required: true },
        customer_ins: { type: Schema.Types.ObjectId, ref: "CustomerInsurance", required: true },
        approval_status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
        approval_time: { type: Date },
        rejection_reason: { type: String }
    },
    { timestamps: true }
);

const InsuranceClaims = models.InsuranceClaims || model("InsuranceClaims", insuranceClaimsSchema);
export default InsuranceClaims;
