import mongoose, { Schema, model, models } from "mongoose";

const claimDocumentsSchema = new Schema(
    {
        document_id: { type: Number, required: true, unique: true },
        claim_id: { type: Schema.Types.ObjectId, ref: "InsuranceClaims", required: true },
        document_path: { type: String, required: true },
        generated_time: { type: Date, default: Date.now }
    },
    { timestamps: true }
);

const ClaimDocuments = models.ClaimDocuments || model("ClaimDocuments", claimDocumentsSchema);
export default ClaimDocuments;
