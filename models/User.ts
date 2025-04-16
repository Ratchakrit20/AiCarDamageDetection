import mongoose, { Schema, model, Document } from "mongoose";

interface IUser extends Document {
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    password: string;
    role: "user" | "admin";
    insurance: mongoose.Schema.Types.ObjectId[]; // ✅ เชื่อมกับ `CustomerInsurance`
}

const userSchema = new Schema<IUser>(
    {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        username: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: { type: String, enum: ["user", "admin"], default: "user" },
        insurance: [{ type: Schema.Types.ObjectId, ref: "CustomerInsurance" }], // ✅ เชื่อมกับ CustomerInsurance
    },
    { timestamps: true }
);

const User = mongoose.models.User || model<IUser>("User", userSchema);
export default User;
