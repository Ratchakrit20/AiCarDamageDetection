import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import CustomerInsurance from "@/models/CustomerInsurance";
import mongoose from "mongoose";

// ไฟล์ backend API
export async function POST(req: NextRequest) {
  try {
    await connectMongoDB();
    const data = await req.json();

    // ✅ ใส่ตรงนี้
    if (
      !data.user_id ||
      !data.customer_ins ||
      !data.policy_number ||
      !data.claim_limit ||
      !data.firstName ||
      !data.lastName
    ) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // แปลง type
    data.claim_limit = mongoose.Types.Decimal128.fromString(data.claim_limit.toString());
    data.user_id = new mongoose.Types.ObjectId(data.user_id);

    const newInsurance = new CustomerInsurance(data);
    await newInsurance.save();

    return NextResponse.json({
      success: true,
      message: "Insurance created successfully",
    }, { status: 201 });

  } catch (error) {
    console.error("❌ Failed to create insurance:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to create insurance",
      error: error instanceof Error ? error.message : error
    }, { status: 500 });
  }
}
