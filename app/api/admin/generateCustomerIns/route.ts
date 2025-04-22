import { connectMongoDB } from "@/lib/mongodb";
import CustomerInsurance from "@/models/CustomerInsurance";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectMongoDB();

    const latest = await CustomerInsurance
      .findOne({ customer_ins: { $ne: null } }) // ป้องกันกรณีมี record ที่ customer_ins เป็น null
      .sort({ customer_ins: -1 })
      .limit(1);

    const next = latest?.customer_ins ? Number(latest.customer_ins) + 1 : 10001;

    console.log("📦 Generate next customer_ins:", next);

    return NextResponse.json({ customer_ins: next });
  } catch (error) {
    console.error("❌ Error generating customer_ins:", error);
    return NextResponse.json({ error: "Failed to generate customer_ins" }, { status: 500 });
  }
}
