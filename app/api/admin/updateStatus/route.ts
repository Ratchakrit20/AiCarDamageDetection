import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import DamageReport from "@/models/Report";

type UpdateData = {
  status: "pending" | "approved" | "rejected";
  rejection_reason?: string;
};

export async function POST(req: Request) {
  try {
    await connectMongoDB();
    const { id, status, reason } = await req.json();

    console.log(`📥 Updating Report ${id} to ${status}`);

    if (!id || !status) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const updateData: UpdateData = { status };
    if (status === "rejected" && reason) {
      updateData.rejection_reason = reason;
    }

    const updatedReport = await DamageReport.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedReport) {
      return NextResponse.json({ message: "Report not found" }, { status: 404 });
    }

    console.log(`✅ Report ${id} updated successfully`);
    return NextResponse.json({ message: "Report updated successfully", data: updatedReport });

  } catch (error) {
    console.error("❌ Error updating report:", error);
    return NextResponse.json({ message: "Internal Server Error", error: String(error) }, { status: 500 });
  }
}
