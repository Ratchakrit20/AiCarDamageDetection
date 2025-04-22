import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import CustomerInsurance from "@/models/CustomerInsurance";

export async function DELETE(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    await connectMongoDB();
    const { id } = context.params;

    // 🔍 เปลี่ยนกลับมาใช้ _id แทน policy_number
    const deletedInsurance = await CustomerInsurance.findByIdAndDelete(id);

    if (!deletedInsurance) {
      return NextResponse.json({
        success: false,
        message: "Insurance not found",
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Insurance deleted successfully",
    });
  } catch (error) {
    console.error("Failed to delete insurance:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to delete insurance",
    }, { status: 500 });
  }
}
