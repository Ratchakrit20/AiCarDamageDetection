import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";

export async function POST(req: Request) {
  try {
    await connectMongoDB();
    const body = await req.json();

    const result = { message: "Model prediction here", body };

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("❌ Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
