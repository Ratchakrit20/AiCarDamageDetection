import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import  DamageReport  from "@/models/Report";

export async function GET(req: Request) {
    try {
        await connectMongoDB();
        const url = new URL(req.url);
        const userId = url.searchParams.get("userId");

        if (!userId) {
            return NextResponse.json({ message: "Missing userId" }, { status: 400 });
        }

        console.log(`📥 Fetching reports for user: ${userId}`);

        const reports = await DamageReport.find({ user_id: userId }).sort({ createdAt: -1 });

        if (!reports.length) {
            return NextResponse.json({ message: "No reports found", data: [] }, { status: 200 });
        }

        return NextResponse.json({ message: "Reports fetched successfully", data: reports });
    } catch (error) {
        console.error("❌ Error fetching reports:", error);
        return NextResponse.json({ message: "Internal Server Error", error: String(error) }, { status: 500 });
    }
}
