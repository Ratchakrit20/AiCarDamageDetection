// /api/admin/insurance-request/list.ts
import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import InsuranceRequest from "@/models/InsuranceRequest";

export async function GET() {
  try {
    await connectMongoDB();

    const requests = await InsuranceRequest.find()
      .populate("user_id", "firstName lastName"); // ✅ แค่ populate user พอแล้ว

    return NextResponse.json({ data: requests }, { status: 200 });
  } catch (err: any) {
    console.error("Error loading insurance requests:", err);
    return NextResponse.json({ message: "Error", error: err.message }, { status: 500 });
  }
}
