import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import PartsPricing from "@/models/PartsPricing";

export async function GET() {
  try {
    await connectMongoDB();
    const parts = await PartsPricing.find();
    return NextResponse.json({ success: true, parts }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Failed to fetch parts", error }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, price, repair } = await req.json();

    if (!name) {
      return NextResponse.json({ success: false, message: "Name is required" }, { status: 400 });
    }

    await connectMongoDB();
    const newPart = new PartsPricing({
      part_id: Math.floor(Math.random() * 10000),
      name,
      price: price ?? 0,
      repair: repair ?? 0,
    });

    await newPart.save();
    return NextResponse.json({ success: true, message: "Part added successfully", part: newPart }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Failed to add part", error }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { part_id, price, repair } = await req.json();
    if (!part_id) {
      return NextResponse.json({ success: false, message: "Part ID is required" }, { status: 400 });
    }

    await connectMongoDB();
    const updatedPart = await PartsPricing.findOneAndUpdate(
      { part_id },
      { price: price ?? 0, repair: repair ?? 0, last_updated: Date.now() },
      { new: true }
    );

    if (!updatedPart) {
      return NextResponse.json({ success: false, message: "Part not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Part updated successfully", part: updatedPart }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Failed to update part", error }, { status: 500 });
  }
}
