// app/api/admin/insurance-request/notify.ts
import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import InsuranceRequest from "@/models/InsuranceRequest";
import Notification from "@/models/Notification";

export async function POST(req: Request) {
  try {
    await connectMongoDB();
    const { requestId, action, reason } = await req.json(); // action = approved / rejected

    const request = await InsuranceRequest.findById(requestId);
    if (!request) return NextResponse.json({ message: "Request not found" }, { status: 404 });

    const message =
      action === "approved"
        ? `✅ กรมธรรม์เลขที่ ${request.policy_number} ได้รับการอนุมัติแล้ว`
        : `❌ กรมธรรม์เลขที่ ${request.policy_number} ไม่ผ่านการอนุมัติ\nเหตุผล: ${reason}`;

    await Notification.create({
      user_id: request.user_id,
      approval_status: action,
      message,
      isRead: false,
      linkTo: "/account", // ไปหน้าบัญชีเพื่อดูสถานะ
    });

    return NextResponse.json({ message: "✅ Notification sent" });
  } catch (err: any) {
    console.error("❌ Notification error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
