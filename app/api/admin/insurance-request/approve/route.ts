import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import InsuranceRequest from "@/models/InsuranceRequest";
import CustomerInsurance from "@/models/CustomerInsurance";
import Notification from "@/models/Notification";

export async function PATCH(req: NextRequest) {
  try {
    await connectMongoDB();
    const { requestId, action, reason } = await req.json();

    const request = await InsuranceRequest.findById(requestId).populate("user_id");
    if (!request) {
      return NextResponse.json({ message: "Request not found" }, { status: 404 });
    }

    // ✅ เปลี่ยนสถานะของ request
    request.status = action;
    await request.save();

    // ✅ ดึงข้อมูลจาก CustomerInsurance ด้วย customer_ins
    const insurance = await CustomerInsurance.findOne({ customer_ins: request.customer_ins });
    if (!insurance) {
      return NextResponse.json({ message: "Insurance data not found" }, { status: 404 });
    }

    if (action === "approved") {
      insurance.status = "approved";
      insurance.rejection_reason = undefined;
      insurance.user_id = request.user_id; // ✅ ผูก user_id ตอนอนุมัติ
    } else {
      insurance.status = "rejected";
      insurance.rejection_reason = reason || "";
    }

    await insurance.save();

    // ✅ แจ้งเตือนผู้ใช้
    await Notification.create({
      user_id: request.user_id,
      approval_status: action,
      message: action === "approved"
        ? "Your insurance request has been approved."
        : `Your insurance request has been rejected: ${reason || "No reason provided."}`,
      isRead: false,
      linkTo: "/account"
    });

    return NextResponse.json({ message: `✅ Request ${action}` });

  } catch (err: any) {
    console.error("❌ Admin approval error:", err);
    return NextResponse.json({ message: "❌ Server error", error: err.message }, { status: 500 });
  }
}
