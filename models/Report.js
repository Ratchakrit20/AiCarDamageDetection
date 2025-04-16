import mongoose, { Schema, model, models } from "mongoose";

// Schema สำหรับการเก็บแต่ละความเสียหาย
const damageSchema = new Schema({
    damage_part: { type: String, required: true },
    detected_type: { type: String, required: true },
    damage_area: { type: Number, required: true }, // เปลี่ยนเป็น Number
    confidence: { type: Number, required: true },
    action_required: { type: String, enum: ["repair", "replace"], required: true },
    cost: { type: Number, required: true }
});

// Schema สำหรับ Report ที่รวมความเสียหายทั้งหมด
const damageReportSchema = new Schema({
    report_id: { type: String, required: true, unique: true }, // ✅ ใช้ UUID หรือ Timestamp
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    car_info: {
        brand: { type: String, required: true },
        model: { type: String, required: true },
        year: { type: String, required: true }
    },
    images: [{ type: String, required: true }], // ✅ เก็บ URL รูปทั้งหมด
    damages: [damageSchema], // ✅ รวมความเสียหายทั้งหมดใน 1 รายงาน
    total_cost: { type: Number, required: true }, // ✅ ราคารวม
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    rejection_reason: { type: String }
}, { timestamps: true });

const DamageReport = models.DamageReport || model("DamageReport", damageReportSchema);
export default DamageReport;
