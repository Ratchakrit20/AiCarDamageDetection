import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import CustomerInsurance from "@/models/CustomerInsurance";

export async function POST(req: NextRequest) {
  try {
    await connectMongoDB();
    const data = await req.json();

    const newInsurance = new CustomerInsurance(data);
    await newInsurance.save();

    return NextResponse.json({
      success: true,
      message: "Insurance created successfully",
    }, { status: 201 });
  } catch (error) {
    console.error("❌ Failed to create insurance:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to create insurance",
      error
    }, { status: 500 });
  }
}
