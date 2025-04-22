import { connectMongoDB } from "@/lib/mongodb";
import InsuranceRequest from "@/models/InsuranceRequest";
import CustomerInsurance from "@/models/CustomerInsurance";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  await connectMongoDB();
  const { requestId, policy_number, user_id, action } = await req.json();

  const request = await InsuranceRequest.findById(requestId);
  if (!request) return NextResponse.json({ message: "ไม่พบคำขอ" }, { status: 404 });

  if (action === "approve") {
    await CustomerInsurance.updateOne({ policy_number }, { user_id });
    request.status = "approved";
    await request.save();
  } else if (action === "reject") {
    request.status = "rejected";
    await request.save();
  }

  return NextResponse.json({ message: "ดำเนินการสำเร็จ" });
}
