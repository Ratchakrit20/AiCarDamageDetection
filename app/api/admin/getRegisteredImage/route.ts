import { connectMongoDB } from "@/lib/mongodb";
import CustomerInsurance from "@/models/CustomerInsurance";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  await connectMongoDB();

  const url = new URL(req.url);
  const userId = url.searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  const insurance = await CustomerInsurance.findOne({ user_id: userId });

  if (!insurance || !insurance.registered_car_image) {
    return NextResponse.json({ registered_car_image: null });
  }

  return NextResponse.json({ registered_car_image: insurance.registered_car_image });
}
