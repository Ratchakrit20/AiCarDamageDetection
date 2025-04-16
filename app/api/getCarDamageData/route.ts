import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  let imageId;

  // ✅ รองรับทั้ง GET และ POST
  if (req.method === "GET") {
    imageId = req.query.imageId; // รับ imageId จาก query string
  } else if (req.method === "POST") {
    imageId = req.body.imageId; // รับ imageId จาก body
  } else {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // ❌ ตรวจสอบว่าได้ `imageId` หรือไม่
  if (!imageId) {
    return res.status(400).json({ error: "Missing imageId parameter" });
  }

  try {
    // 🔥 ตัวอย่างข้อมูลที่ API ส่งกลับให้ Frontend
    const fakeData = {
      imageUrl: `/images/detected-${imageId}.jpg`,
      car_info: {
        brand: "Toyota",
        model: "Corolla",
        year: "2020",
        confidence: 98.5,
      },
      damages: [
        { part: "Front Bumper", type: "Scratch", area: 30, recommend: "repair", cost: 200 },
        { part: "Left Door", type: "Dent", area: 50, recommend: "replace", cost: 500 },
      ],
    };

    return res.status(200).json(fakeData);
  } catch (error) {
    console.error("❌ API Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
