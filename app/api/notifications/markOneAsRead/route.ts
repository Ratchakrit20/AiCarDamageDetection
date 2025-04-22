import { NextResponse } from "next/server";
import Notification from "@/models/Notification";
import { connectMongoDB } from "@/lib/mongodb";
import mongoose from "mongoose";

export async function POST(req: Request) {
  await connectMongoDB();
  const { notificationId } = await req.json();

  if (!notificationId) {
    return NextResponse.json({ error: "Missing notificationId" }, { status: 400 });
  }

  try {
    await Notification.findByIdAndUpdate(
      new mongoose.Types.ObjectId(notificationId),
      { isRead: true }
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating notification:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
