// /api/notification/getUserNotifications.ts
import { NextResponse } from "next/server";
import Notification from "@/models/Notification";
import { connectMongoDB } from "@/lib/mongodb";

export async function GET(req: Request) {
  await connectMongoDB();
  const url = new URL(req.url);
  const userId = url.searchParams.get("userId");


  if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

  const notifications = await Notification.find({ user_id: userId }).sort({ createdAt: -1 });
  return NextResponse.json({ data: notifications });
}
