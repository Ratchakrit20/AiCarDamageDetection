import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import CustomerInsurance from "@/models/CustomerInsurance";

export async function GET(req: NextRequest) {
  try {
    await connectMongoDB();

    const insurances = await CustomerInsurance.find().lean();
    return NextResponse.json(insurances, { status: 200 });
  } catch (error) {
    console.error("❌ Failed to fetch insurances:", error);
    return NextResponse.json({ error: "Failed to fetch insurances" }, { status: 500 });
  }
}
