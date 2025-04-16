import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/User";
import CustomerInsurance from "@/models/CustomerInsurance";
import { Types } from "mongoose";

// ✅ กำหนด Type ให้กับ Insurance
interface Insurance {
    _id: Types.ObjectId;
    policy_number: string;
    insurance_type: string;
    policy_start_date: Date;
    policy_end_date: Date;
    car_brand: string;
    car_model: string;
    car_year: number;
    license_plate: string;
    claim_limit: Types.Decimal128;
    coverage_details?: string;
}

export async function GET() {
    try {
        await connectMongoDB();

        // ✅ ดึง User พร้อมข้อมูล insurance
        const users = await User.find()
            .populate({
                path: "insurance",
                model: CustomerInsurance
            })
            .lean(); // ✅ ใช้ lean() เพื่อให้ได้ JSON ปกติ

        if (!users || users.length === 0) {
            return NextResponse.json({ message: "No users found" }, { status: 404 });
        }

        // ✅ แปลง `Decimal128` เป็น `number` และคืนค่าให้ frontend
        const formattedUsers = users.map(user => ({
            ...user,
            insurance: user.insurance?.map((policy: Insurance) => ({
                ...policy,
                claim_limit: policy.claim_limit ? parseFloat(policy.claim_limit.toString()) : 0
            })) || []
        }));

        console.log("✅ Users with Insurance Data:", formattedUsers); // ตรวจสอบค่าที่ได้
        return NextResponse.json({ data: formattedUsers }, { status: 200 });

    } catch (error: unknown) {
        console.error("❌ API Error:", error);

        if (error instanceof Error) {
            return NextResponse.json({ message: "Failed to fetch users", error: error.message }, { status: 500 });
        }

        return NextResponse.json({ message: "Failed to fetch users", error: "Unknown error occurred" }, { status: 500 });
    }
}
