import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import CustomerInsurance from "@/models/CustomerInsurance";
import User from "@/models/User";

export async function POST(req: Request) {
    await connectMongoDB();

    try {
        const { userId, insurance } = await req.json();

        if (!userId || !insurance) {
            return NextResponse.json({ message: "❌ Missing userId or insurance data" }, { status: 400 });
        }

        // ✅ ตรวจสอบว่า User มีอยู่ในฐานข้อมูลหรือไม่
        const userExists = await User.findById(userId);
        if (!userExists) {
            return NextResponse.json({ message: "❌ User not found" }, { status: 404 });
        }

        // ✅ ตรวจสอบว่าหมายเลขกรมธรรม์ซ้ำกันหรือไม่
        const existingPolicy = await CustomerInsurance.findOne({ policy_number: insurance.policy_number });
        if (existingPolicy) {
            return NextResponse.json({ message: "❌ Policy number already exists" }, { status: 400 });
        }

        // ✅ หา `customer_ins` ลำดับถัดไป
        const lastInsurance = await CustomerInsurance.findOne().sort({ customer_ins: -1 });
        const nextCustomerIns = lastInsurance ? lastInsurance.customer_ins + 1 : 10001;

        // ✅ สร้างข้อมูลประกันใหม่
        const newInsurance = await CustomerInsurance.create({
            ...insurance,
            customer_ins: nextCustomerIns, // ✅ กำหนดค่าให้ `customer_ins`
            user_id: userId
        });

        // ✅ อัปเดต User ให้เชื่อมโยงกับ Insurance
        await User.findByIdAndUpdate(userId, { $push: { insurance: newInsurance._id } });

        return NextResponse.json({ message: "✅ Insurance added successfully", data: newInsurance }, { status: 200 });

    } catch (error: unknown) {
        console.error("❌ Add Insurance Error:", error);

        if (error instanceof Error) {
            return NextResponse.json({ message: "❌ Failed to add insurance", error: error.message }, { status: 500 });
        }

        return NextResponse.json({ message: "❌ Unknown error occurred" }, { status: 500 });
    }
}
