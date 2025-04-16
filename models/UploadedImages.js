import mongoose, { Schema, model, models } from "mongoose";

const uploadedImagesSchema = new Schema(
    {
        image_id: { type: Number, required: true, unique: true },
        user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
        image_path: { type: String, required: true },
        upload_time: { type: Date, default: Date.now },
        status: { type: String, enum: ["processing", "completed", "error"], default: "processing" },
        rejection_detail: { type: String }
    },
    { timestamps: true }
);

const UploadedImages = models.UploadedImages || model("UploadedImages", uploadedImagesSchema);
export default UploadedImages;
