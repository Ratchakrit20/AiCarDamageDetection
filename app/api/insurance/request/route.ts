import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import CustomerInsurance from "@/models/CustomerInsurance";
import InsuranceRequest from "@/models/InsuranceRequest";

export async function POST(req: NextRequest) {
  try {
    await connectMongoDB();
    const body = await req.json();

    const { policy_number, firstName, lastName, user_id } = body;

    // ✅ ตรวจสอบว่ามีกรมธรรม์จริงไหม
    const insurance = await CustomerInsurance.findOne({
      policy_number,
      firstName,
      lastName,
    });

    if (!insurance) {
      return NextResponse.json({ message: "ไม่พบข้อมูลประกันที่ตรงกัน" }, { status: 404 });
    }

    // ✅ ตรวจสอบว่าผู้ใช้เคยยื่นคำขอไปแล้วหรือยัง
    const existingRequest = await InsuranceRequest.findOne({
      policy_number,
      user_id,
    });

    if (existingRequest) {
      return NextResponse.json({ message: "คุณได้ส่งคำขอไว้แล้ว รอการอนุมัติ" }, { status: 400 });
    }

    // ✅ บันทึกคำขอใหม่
    await InsuranceRequest.create({
      policy_number,
      user_id,
      status: "pending",
    });

    return NextResponse.json({ message: "ส่งคำขอยืนยันแล้ว กรุณารอการอนุมัติ" });
  } catch (error) {
    console.error("❌ Error while submitting insurance request:", error);
    return NextResponse.json({ message: "เกิดข้อผิดพลาด", error }, { status: 500 });
  }
}
