import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "../../../../lib/mongodb";
import { DamageReport } from "../../../../models/DamageDetails";
import User from "../../../../models/User";

export async function GET(req: NextRequest) {
    try {
        await connectMongoDB();
        const url = new URL(req.url);
        const reportId = url.searchParams.get("id");

        if (!reportId) {
            return NextResponse.json({ message: "Missing report ID" }, { status: 400 });
        }

        console.log(`📥 Fetching report: ${reportId}`);

        const report = await DamageReport.findById(reportId)
            .populate("user_id", "firstName lastName email");

        if (!report) {
            return NextResponse.json({ message: "Report not found" }, { status: 404 });
        }

        console.log("✅ Report Found:", report);
        return NextResponse.json({ message: "Report fetched successfully", data: report });

    } catch (error) {
        console.error("❌ Error fetching report:", error);
        return NextResponse.json({
            message: "Internal Server Error",
            error: error instanceof Error ? error.message : String(error),
        }, { status: 500 });
    }
}
