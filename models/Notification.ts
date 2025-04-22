import mongoose, { Schema, model, models } from "mongoose";

const notificationSchema = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true }, // 👈 เปลี่ยนเป็น user_id
    message: { type: String, required: true },
    approval_status: { type: String, enum: ["approved", "rejected"], required: true },
    isRead: { type: Boolean, default: false },
    linkTo: { type: String }
  }, { timestamps: true });
  

const Notification = models.Notification || model("Notification", notificationSchema);
export default Notification;
