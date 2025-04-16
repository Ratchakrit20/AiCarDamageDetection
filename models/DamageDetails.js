import mongoose, { Schema, model, models } from "mongoose";

// 🛠️ รายงานความเสียหาย (Report)
const damageReportSchema = new Schema(
    {
        report_id: { type: String, required: true, unique: true }, // ✅ ใช้ UUID
        user_id: { type: Schema.Types.ObjectId, ref: "User", required: true }, // ✅ อ้างอิงไปยัง User
        car_info: {
            brand: String,
            model: String,
            year: String,
        },
        images: [String], // ✅ เก็บ URL ของภาพทั้งหมด
        damages: [{ type: Schema.Types.ObjectId, ref: "DamageDetail" }], // ✅ เชื่อมกับความเสียหายแต่ละจุด
        total_cost: { type: mongoose.Types.Decimal128, required: true }, // ✅ ค่าซ่อมหรือเปลี่ยนทั้งหมด
        status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" }, // ✅ สถานะของรายงาน
        rejection_reason: { type: String }, // ✅ เหตุผลที่ถูก Reject (ถ้ามี)
    },
    { timestamps: true }
);

const DamageReport = models.DamageReport || model("DamageReport", damageReportSchema);

// 🔧 รายละเอียดของแต่ละความเสียหาย
const damageDetailSchema = new Schema(
    {
        report_id: { type: Schema.Types.ObjectId, ref: "DamageReport", required: true }, // ✅ อ้างอิงไปยัง Report
        damage_part: { type: String, required: true }, // ✅ ส่วนที่เสียหาย (เช่น MIRROR, HOOD)
        detected_type: { type: String, required: true }, // ✅ ประเภทของความเสียหาย
        damage_area: { type: mongoose.Types.Decimal128, required: true }, // ✅ เปอร์เซ็นต์พื้นที่เสียหาย
        confidence: { type: mongoose.Types.Decimal128, required: true }, // ✅ ระดับความมั่นใจ
        action_required: { type: String, enum: ["repair", "replace"], required: true }, // ✅ ซ่อมหรือเปลี่ยน
        cost: { type: mongoose.Types.Decimal128, required: true }, // ✅ ราคาซ่อมหรือเปลี่ยน
    },
    { timestamps: true }
);

const DamageDetail = models.DamageDetail || model("DamageDetail", damageDetailSchema);

export { DamageReport, DamageDetail };
