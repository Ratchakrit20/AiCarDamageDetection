// app/api/user/getCustomerInsurance/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import CustomerInsurance from "@/models/CustomerInsurance";

export async function GET(req: NextRequest) {
  try {
    await connectMongoDB();

    const id = req.nextUrl.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ message: "❌ Missing user ID" }, { status: 400 });
    }

    const customerInsurance = await CustomerInsurance.findOne({ user_id: id });

    if (!customerInsurance) {
      return NextResponse.json({ message: "❌ Insurance not found for this user" }, { status: 404 });
    }

    return NextResponse.json({ data: customerInsurance }, { status: 200 });

  } catch (error: any) {
    console.error("❌ Error in getCustomerInsurance:", error);
    return NextResponse.json(
      { message: "❌ Error fetching insurance data", error: error.message },
      { status: 500 }
    );
  }
}
