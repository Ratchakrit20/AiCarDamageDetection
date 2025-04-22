// /app/api/user/getCustomerInsurance/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import CustomerInsurance from "@/models/CustomerInsurance";

export async function GET(req: NextRequest) {
  try {
    await connectMongoDB();
    const url = new URL(req.url);
    const userId = url.searchParams.get("id");

    if (!userId) {
      return NextResponse.json({ message: "Missing userId" }, { status: 400 });
    }

    const insurance = await CustomerInsurance.findOne({ user_id: userId });

    if (!insurance) {
      return NextResponse.json({ message: "ไม่พบข้อมูลประกันของผู้ใช้นี้" }, { status: 404 });
    }

    return NextResponse.json({ data: insurance });
  } catch (err: any) {
    console.error("❌ Failed to get insurance:", err);
    return NextResponse.json({ message: "Server error", error: err.message }, { status: 500 });
  }
}
