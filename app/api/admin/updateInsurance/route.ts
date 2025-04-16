import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import CustomerInsurance from "@/models/CustomerInsurance";

export async function POST(req: Request) {
    await connectMongoDB();
    const { insuranceId, insurance } = await req.json();

    try {
        const updatedInsurance = await CustomerInsurance.findByIdAndUpdate(insuranceId, insurance, {
            new: true,
            runValidators: true,
        });

        if (!updatedInsurance) {
            return NextResponse.json({ message: "❌ Insurance not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "✅ Insurance updated successfully", data: updatedInsurance }, { status: 200 });

    } catch (error: unknown) {
        console.error("❌ Update Insurance Error:", error);

        // ✅ แก้ไข TypeScript Error โดยใช้ instanceof Error
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";

        return NextResponse.json({ message: "❌ Failed to update insurance", error: errorMessage }, { status: 500 });
    }
}
