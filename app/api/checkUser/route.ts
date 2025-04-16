import { NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(req: Request) {
    try {
        await connectMongoDB();
        
        const { username, email } = await req.json();

        const existingEmail = await User.findOne({ email }).select("_id");
        const existingUsername = await User.findOne({ username }).select("_id");

        return NextResponse.json({ existingEmail, existingUsername });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
