import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../../lib/mongodb";
import DamageReport from "../../../../models/Report";
import User from "../../../../models/User"; // ✅ ดึงข้อมูล User

export async function GET(req: Request) {
    try {
        await connectMongoDB();

        const url = new URL(req.url);
        const status = url.searchParams.get("status") || "pending";

        console.log(`📥 Fetching reports with status: ${status}`);

        // ✅ Populate user_id และให้แน่ใจว่า `report_id` ถูกต้อง
        const reports = await DamageReport.find({ status }).populate("user_id", "firstName lastName email");

        if (!reports.length) {
            console.warn("⚠️ No reports found for status:", status);
            return NextResponse.json({ message: "No reports found", data: [] }, { status: 200 });
        }

        console.log(`✅ Found ${reports.length} reports`);
        return NextResponse.json({ message: "Reports fetched successfully", data: reports });

    } catch (error) {
        console.error("❌ Error fetching reports:", error);
        return NextResponse.json({
            message: "Internal Server Error",
            error: error instanceof Error ? error.message : String(error),
        }, { status: 500 });
    }
}
