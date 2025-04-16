import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: Request) {
    await connectMongoDB();
    const { userId } = await req.json();

    try {
        await User.findByIdAndDelete(userId);
        return NextResponse.json({ message: "User deleted successfully" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "Failed to delete user", error }, { status: 500 });
    }
}
