import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import CustomerInsurance from "@/models/CustomerInsurance";

export async function GET(req: NextRequest) {
  await connectMongoDB();

  const userId = req.nextUrl.searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ message: "Missing userId" }, { status: 400 });
  }

  const insurance = await CustomerInsurance.find({ user_id: userId });

  if (!insurance || insurance.length === 0) {
    return NextResponse.json({ message: "No insurance found" }, { status: 404 });
  }

  return NextResponse.json({ data: insurance }, { status: 200 });
}
