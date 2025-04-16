import { NextResponse } from 'next/server';
import { connectMongoDB } from '../../../lib/mongodb'
import User from '../../../models/User';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
    try {
        const { firstName, lastName, email, username, password } = await req.json();
      
        const hashedPassword = await bcrypt.hash(password, 10);
        
        await connectMongoDB();

        // บันทึกผู้ใช้ใหม่ในฐานข้อมูล
        await User.create({
            firstName,
            lastName,
            email,
            username,
            password: hashedPassword,
            role: "user", // ✅ ค่า default เป็น "user"
        });
        return NextResponse.json({ message: 'Account created successfully'});
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
