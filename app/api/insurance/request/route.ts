import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import InsuranceRequest from "@/models/InsuranceRequest";
import CustomerInsurance from "@/models/CustomerInsurance";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    await connectMongoDB();
    const body = await req.json();

    const { userId, insurance } = body;

    if (!userId || !insurance?.policy_number || !insurance?.license_plate) {
      return NextResponse.json({ message: "❌ Missing required fields" }, { status: 400 });
    }

    // 🔍 ตรวจสอบว่ามี CustomerInsurance ที่ตรงกับข้อมูลไหม
    const matchedCustomer = await CustomerInsurance.findOne({
      policy_number: insurance.policy_number,
      license_plate: insurance.license_plate,
    });

    if (!matchedCustomer) {
      return NextResponse.json({ message: "❌ ไม่พบข้อมูลกรมธรรม์ในระบบ" }, { status: 404 });
    }

    // 🔄 ป้องกันการส่งซ้ำ
    const existingRequest = await InsuranceRequest.findOne({
      user_id: userId,
      policy_number: insurance.policy_number,
      status: "pending",
    });

    if (existingRequest) {
      return NextResponse.json({ message: "❗ คุณมีคำขอที่ยังรอดำเนินการ" }, { status: 400 });
    }

    // ✅ สร้างคำขอใหม่
    const newRequest = await InsuranceRequest.create({
      user_id: userId,
      customer_ins: matchedCustomer.customer_ins,

      policy_number: insurance.policy_number,
      insurance_type: insurance.insurance_type,
      policy_start_date: insurance.policy_start_date,
      policy_end_date: insurance.policy_end_date,
      car_brand: insurance.car_brand,
      car_model: insurance.car_model,
      car_year: insurance.car_year,
      license_plate: insurance.license_plate,
      claim_limit: insurance.claim_limit,
      coverage_details: insurance.coverage_details,

      status: "pending",
    });

    return NextResponse.json({ message: "✅ ส่งคำขอลงทะเบียนสำเร็จ", data: newRequest }, { status: 201 });
  } catch (err: any) {
    console.error("❌ Error submitting insurance request:", err);
    return NextResponse.json({ message: "❌ Server error", error: err.message }, { status: 500 });
  }
}
