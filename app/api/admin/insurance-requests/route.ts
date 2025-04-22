import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import InsuranceRequest from "@/models/InsuranceRequest";

export async function GET() {
  try {
    await connectMongoDB();

    const requests = await InsuranceRequest.find({}).lean(); // << ดึงข้อมูลเป็น plain object

    return NextResponse.json(requests);
  } catch (error) {
    console.error("❌ Error fetching insurance requests:", error);
    return NextResponse.json({ message: "ดึงข้อมูลล้มเหลว" }, { status: 500 });
  }
}
