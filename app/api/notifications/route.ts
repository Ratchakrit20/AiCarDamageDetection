import { NextResponse } from "next/server";

export async function GET() {
  const dummyNotifications = [
    {
      _id: "1",
      message: "รายงานของคุณได้รับการอนุมัติแล้ว!",
      status: "approved",
      createdAt: new Date().toISOString(),
      link: "/AiCarDamgeDetection/process/123",
      isRead: false,
    },
    {
      _id: "2",
      message: "รายงานของคุณถูกปฏิเสธ",
      status: "rejected",
      createdAt: new Date(Date.now() - 3600 * 1000).toISOString(),
      link: "/AiCarDamgeDetection/process/124",
      isRead: true,
    },
  ];

  return NextResponse.json({ notifications: dummyNotifications });
}
