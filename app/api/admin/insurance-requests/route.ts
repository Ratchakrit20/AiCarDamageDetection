import { connectMongoDB } from "@/lib/mongodb";
import InsuranceRequest from "@/models/InsuranceRequest";
import { NextResponse } from "next/server";

export async function GET() {
  await connectMongoDB();
  const requests = await InsuranceRequest.find().sort({ request_date: -1 });
  return NextResponse.json(requests);
}
