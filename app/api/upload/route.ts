import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

const s3Client = new S3Client({
    region: "us-east-1",
    endpoint: "http://127.0.0.1:9000", // ✅ เปลี่ยนเป็น localhost หรือ 127.0.0.1 ก็ได้
    credentials: {
      accessKeyId: "minioadmin",
      secretAccessKey: "minioadmin",
    },
  });
  

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("image") as File;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const fileName = uuidv4() + "-" + file.name;

  const params = {
    Bucket: "my-app-images",
    Key: fileName,
    Body: buffer,
    ContentType: file.type,
  };

  try {
    await s3Client.send(new PutObjectCommand(params));
    const fileUrl = `http://localhost:9000/my-app-images/${fileName}`;

    return NextResponse.json({ url: fileUrl });
  } catch (error) {
    console.error("❌ Upload Error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
