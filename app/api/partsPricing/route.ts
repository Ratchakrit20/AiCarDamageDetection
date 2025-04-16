import { NextRequest, NextResponse } from 'next/server';
import { connectMongoDB } from '../../../lib/mongodb';
import PartsPricing from '@/models/PartsPricing';

export async function GET(req: NextRequest) {
  try {
    await connectMongoDB();

    const pricing = await PartsPricing.find({});

    return NextResponse.json(pricing, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch pricing data.' }, { status: 500 });
  }
}
