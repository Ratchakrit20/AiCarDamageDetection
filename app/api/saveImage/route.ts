import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    console.log("✅ Received Image Data:", data);

    if (!data.imageBase64) {
      console.error("❌ No image provided");
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // จำลองการบันทึกภาพ
    return NextResponse.json({ success: true, imageId: "12345", message: "Image saved" });
  } catch (error) {
    console.error("❌ Error saving image:", error);
    return NextResponse.json({ error: "Failed to save image" }, { status: 500 });
  }
}
