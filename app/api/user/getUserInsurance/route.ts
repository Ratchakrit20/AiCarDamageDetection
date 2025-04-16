import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectMongoDB } from "@/lib/mongodb";
import CustomerInsurance from "@/models/CustomerInsurance";

export async function GET(req: Request) {
    await connectMongoDB();

    const session = await getServerSession(authOptions);
    console.log("✅ API Session:", session); // 🔹 เช็ค session

    if (!session?.user?.id) {
        console.error("❌ User ID not found in session");
        return NextResponse.json({ message: "User ID not found. Please login again." }, { status: 401 });
    }

    try {
        const insurance = await CustomerInsurance.findOne({ user_id: session.user.id });

        if (!insurance) {
            return NextResponse.json({ message: "No insurance found" }, { status: 404 });
        }

        return NextResponse.json({ insurance }, { status: 200 });
    } catch (error: unknown) {
        console.error("❌ API Error:", error);
        return NextResponse.json({ message: "Failed to fetch insurance", error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
    }
}
