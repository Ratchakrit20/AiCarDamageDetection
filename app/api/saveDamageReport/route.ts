import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import DamageReport from "../../../models/Report";

export async function POST(req: NextRequest) {
  try {
    await connectMongoDB();
    const reportData = await req.json();

    const newReport = new DamageReport(reportData);
    await newReport.save();

    return NextResponse.json({ success: true, message: "Report saved successfully" }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Failed to save report", error }, { status: 500 });
  }
}
