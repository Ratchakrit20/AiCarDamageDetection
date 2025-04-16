import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import DamageDetection from "@/models/DamageDetection";

export async function GET(req: Request) {
    try {
        await connectMongoDB();
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");

        console.log("✅ API Received userId:", userId); // ✅ Debug

        if (!userId) {
            console.error("❌ Missing userId");
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }

        const reports = await DamageDetection.find({ userId }).lean();
        console.log("✅ Found reports:", reports.length); // ✅ Debug

        return NextResponse.json(reports);
    } catch (error) {
        console.error("🔥 API Error:", error);
        return NextResponse.json({ error: "Failed to fetch process data" }, { status: 500 });
    }
}
