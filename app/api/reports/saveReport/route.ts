// import { NextApiRequest, NextApiResponse } from "next";
// import { connectMongoDB } from '../../../../lib/mongodb';

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method !== "POST") {
//     return res.status(405).json({ message: "Method not allowed" });
//   }

//   try {
//     const db = await connectMongoDB(); // ✅ รับ db จาก connectMongoDB
//     const reportData = req.body;

//     // ✅ บันทึกรายงานลงใน collection "reports"
//     const result = await db.collection("reports").insertOne(reportData);

//     if (result.insertedId) {
//       return res.status(200).json({ message: "Report saved successfully!" });
//     } else {
//       return res.status(500).json({ message: "Failed to save report" });
//     }
//   } catch (error) {
//     console.error("Error saving report:", error);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// }