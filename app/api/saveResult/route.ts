import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import DamageDetection from "@/models/DamageDetection";
import { v4 as uuidv4 } from "uuid";

// Define a type for the damage object
interface Damage {
    part: string;
    type: string;
    area: string; // Assuming area is passed as a string
    recommend: string;
}

export async function POST(req: Request) {
    try {
        await connectMongoDB();
        console.log("✅ Connected to MongoDB");

        const { imageUrl, carInfo, damageDetails } = await req.json();
        console.log("📸 Received Data:", { imageUrl, carInfo, damageDetails });

        if (!imageUrl || !damageDetails.length) {
            console.error("🚨 Missing imageUrl or damageDetails");
            return NextResponse.json({ message: "Invalid data" }, { status: 400 });
        }

        const imageId = uuidv4();

        // Save each damage detail
        const results = await Promise.all(
            damageDetails.map(async (damage: Damage) => {
                return await DamageDetection.create({
                    result_id: uuidv4(),
                    image_id: imageId,
                    image_url: imageUrl,
                    damage_part: damage.part,
                    detected_type: damage.type,
                    damage_area: parseFloat(damage.area), // Convert String to Number
                    confidence: parseFloat(carInfo.confidence),
                    action_required: damage.recommend,
                    status: "pending",
                });
            })
        );

        console.log("✅ Saved Results:", results);
        return NextResponse.json({ message: "Data saved successfully" });

    } catch (error) {
        // Narrow down the type of error
        if (error instanceof Error) {
            console.error("🔥 Database Error:", error.message);
            return NextResponse.json({ message: "Failed to save data", error: error.message }, { status: 500 });
        } else {
            console.error("🔥 Unknown Error:", error);
            return NextResponse.json({ message: "Failed to save data", error: "An unknown error occurred" }, { status: 500 });
        }
    }
}