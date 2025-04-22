// app/api/insurance/request/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import InsuranceRequest from "@/models/InsuranceRequest";
import CustomerInsurance from "@/models/CustomerInsurance";

export async function POST(req: NextRequest) {
  await connectMongoDB();

  const body = await req.json();
  const { user_id, policy_number, license_plate } = body;

  if (!user_id || !policy_number || !license_plate) {
    return NextResponse.json({ message: "❌ Missing required fields" }, { status: 400 });
  }

  const match = await CustomerInsurance.findOne({
    policy_number,
    license_plate,
  });

  const match_found = !!match;

  const existing = await InsuranceRequest.findOne({ user_id });
  if (existing) {
    return NextResponse.json({ message: "❌ You already submitted a request." }, { status: 400 });
  }

  const newRequest = await InsuranceRequest.create({
    user_id,
    policy_number,
    license_plate,
    match_found,
    status: "pending",
  });

  return NextResponse.json({ message: "✅ Request submitted", data: newRequest });
}
