import { NextRequest, NextResponse } from "next/server";
import CustomerInsurance from "@/models/CustomerInsurance";
import { connectMongoDB } from "@/lib/mongodb";

export async function GET(req: NextRequest) {
  try {
    await connectMongoDB();
    const userId = req.nextUrl.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const insurance = await CustomerInsurance.findOne({ user_id: userId, status: "approved" });

    if (!insurance) {
      return NextResponse.json({ error: "No approved insurance found" }, { status: 404 });
    }

    return NextResponse.json({ registered_car_image: insurance.registered_car_image });
  } catch (error) {
    console.error("❌ Failed to fetch registered image:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
