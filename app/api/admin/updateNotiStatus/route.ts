import Notification from "@/models/Notification";
import { DamageReport } from "@/models/DamageDetails";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { id, status, reason } = await req.json(); // ✅ ดึงข้อมูลจาก body

    // ✅ หา report จาก database
    const report = await DamageReport.findById(id);
    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // ✅ สร้างการแจ้งเตือน
    await Notification.create({
      user_id: report.user_id, // ต้องตรงกับ schema คือ user_id
      approval_status: status, // enum ต้องมี "approved" หรือ "rejected"
      message:
        status === "approved"
          ? "Your report has been approved!"
          : `Your report has been rejected: ${reason}`,
      isRead: false,
      linkTo: `/AiCarDamgeDetection/process/${report._id}`,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("⨯ Notification Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
