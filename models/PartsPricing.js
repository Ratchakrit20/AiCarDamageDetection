import mongoose, { Schema, model, models } from "mongoose";

const partsPricingSchema = new Schema(
    {
        part_id: { type: Number, required: true, unique: true },
        name: { type: String, required: true },
        price: { type: mongoose.Types.Decimal128, required: true },
        repair: { type: mongoose.Types.Decimal128, required: true },
        last_updated: { type: Date, default: Date.now }
    },
    { timestamps: true }
);

const PartsPricing = models.PartsPricing || model("PartsPricing", partsPricingSchema);
export default PartsPricing;
