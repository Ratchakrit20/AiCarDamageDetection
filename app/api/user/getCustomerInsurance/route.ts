// app/api/user/getCustomerInsurance/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import CustomerInsurance from "@/models/CustomerInsurance";

export async function GET(req: NextRequest) {
    try {
        await connectMongoDB();
        const id = req.nextUrl.searchParams.get("id");
        const customerInsurance = await CustomerInsurance.findOne({ user_id: id });

        if (!customerInsurance) {
            return NextResponse.json({ message: "Not found" }, { status: 404 });
        }

        return NextResponse.json({ data: customerInsurance }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "Error fetching data", error }, { status: 500 });
    }
}
