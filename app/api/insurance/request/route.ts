import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import CustomerInsurance from "@/models/CustomerInsurance";
import InsuranceRequest from "@/models/InsuranceRequest";

export async function POST(req: NextRequest) {
  try {
    await connectMongoDB();
    const body = await req.json();

    const { policy_number, firstName, lastName, user_id } = body;

    if (!policy_number || !firstName || !lastName || !user_id) {
      return NextResponse.json({ message: "กรุณากรอกข้อมูลให้ครบ" }, { status: 400 });
    }

    console.log("🔎 Incoming verify:", { policy_number, firstName, lastName });

    const insurance = await CustomerInsurance.findOne({
      policy_number,
      firstName: { $regex: `^${firstName.trim()}$`, $options: "i" },
      lastName: { $regex: `^${lastName.trim()}$`, $options: "i" },
    });


    if (!insurance) {
      return NextResponse.json({ message: "ไม่พบข้อมูลประกันที่ตรงกัน" }, { status: 404 });
    }

    const existingRequest = await InsuranceRequest.findOne({
      policy_number,
      user_id,
    });

    if (existingRequest) {
      return NextResponse.json({ message: "คุณได้ส่งคำขอไว้แล้ว รอการอนุมัติ" }, { status: 400 });
    }

    await InsuranceRequest.create({
      policy_number,
      user_id,
      firstName,
      lastName,
      status: "pending",
    });
    
    

    return NextResponse.json({ message: "ส่งคำขอยืนยันแล้ว กรุณารอการอนุมัติ" });
  } catch (error) {
    console.error("❌ Error while submitting insurance request:", error);
    return NextResponse.json({ message: "เกิดข้อผิดพลาด", error }, { status: 500 });
  }
}
