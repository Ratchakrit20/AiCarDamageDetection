import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import CustomerInsurance from "@/models/CustomerInsurance";
import mongoose from "mongoose";

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    await connectMongoDB();
    const params = await props.params;
    const insuranceId = params.id;
    const body = await req.json();

    const updated = await CustomerInsurance.findByIdAndUpdate(insuranceId, body, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return NextResponse.json({ success: false, message: "Insurance not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated }, { status: 200 });
  } catch (error) {
    console.error("❌ Failed to update insurance:", error);
    return NextResponse.json({ success: false, message: "Failed to update insurance", error }, { status: 500 });
  }
}
