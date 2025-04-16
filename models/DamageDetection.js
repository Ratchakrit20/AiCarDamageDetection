import mongoose, { Schema, model, models } from "mongoose";

const damageDetectionSchema = new Schema(
    {
        result_id: { type: String, required: true, unique: true }, // ✅ เปลี่ยนเป็น UUID
        image_id: { type: String, required: true }, // ✅ UUID แทน ObjectId
        image_url: { type: String, required: true }, // ✅ เก็บ URL ของภาพ
        damage_part: { type: String, required: true },
        detected_type: { type: String, required: true },
        damage_area: { type: mongoose.Types.Decimal128, required: true },
        confidence: { type: mongoose.Types.Decimal128, required: true },
        action_required: { type: String, enum: ["repair", "replace"], required: true },
        status: { type: String, enum: ["pending", "completed", "error"], default: "pending" },
        rejection_detail: { type: String }
    },
    { timestamps: true }
);

const DamageDetection = models.DamageDetection || model("DamageDetection", damageDetectionSchema);
export default DamageDetection;
