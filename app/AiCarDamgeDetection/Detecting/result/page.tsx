"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { Progress } from "../../../components/ui/progress";

export default function ResultPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { data: session } = useSession();
    const imageUrl = searchParams.get("image");

    // 📌 Mock Data (แทนที่ด้วย API)
    const carInfo = {
        brand: "Mercedes-Benz",
        model: "E-Class",
        year: "2015-2020",
        confidence: 90
    };

    const damageDetails = [
        { part: "MIRROR", type: "BROKEN PART", area: 99.67, recommend: "replace", cost: 500 },
        { part: "BACK-DOOR", type: "BROKEN PART", area: 70.53, recommend: "replace", cost: 700 },
        { part: "ROCKER-PANEL", type: "BROKEN PART", area: 68.40, recommend: "replace", cost: 400 },
        { part: "QUARTER-PANEL", type: "BROKEN PART / DENT", area: 63.40, recommend: "replace", cost: 600 },
        { part: "BACK-BUMPER", type: "DENT", area: 25.28, recommend: "repair", cost: 300 },
    ];

    const handleSave = async () => {
        try {
            const response = await fetch("/api/saveReport", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: session?.user.id,
                    car_info: carInfo,
                    images: [imageUrl],  // ✅ ต้องเป็น Array ของ URL
                    damages: damageDetails, // ✅ ต้องส่งเป็น Array โดยตรง ไม่ต้อง JSON.stringify()
                    total_cost: damageDetails.reduce((sum, damage) => sum + (damage.cost || 0), 0),
                }),
            });
    
            const result = await response.json();
            if (response.ok) {
                alert("✅ Data saved successfully!");
                router.push("/AiCarDamgeDetection");
            } else {
                alert(`❌ Error: ${result.message}`);
            }
        } catch (error) {
            console.error("❌ Save error:", error);
            alert("Failed to save data");
        }
    };
    
    

    return (
        <div className="min-h-screen bg-black text-white px-10 py-6">
            <div className="flex justify-between">
                <h2 className="text-lg font-bold">Car Identification</h2>
                <p>Brand: <span className="text-red-500">{carInfo.brand}</span></p>
                <p>Model: <span className="text-orange-400">{carInfo.model}</span></p>
                <p>Year: <span className="text-yellow-400">{carInfo.year}</span></p>
                <p>Confidence: <span className="text-green-400">{carInfo.confidence}%</span></p>
            </div>

            <div className="mt-6">
                <h2 className="text-lg font-bold">Damage Frame</h2>
                {imageUrl && <Image src={imageUrl} width={500} height={300} alt="Damage Frame" className="mt-4 rounded-lg shadow-lg" />}
            </div>

            <div className="mt-6 bg-gray-900 p-4 rounded-lg">
                <table className="w-full text-center">
                    <thead className="border-b border-gray-700">
                        <tr>
                            <th>Damaged Part</th>
                            <th>Damage Type</th>
                            <th>Damage Area</th>
                            <th>Recommend</th>
                            <th>Total Cost</th>
                        </tr>
                    </thead>
                    <tbody>
                        {damageDetails.map((item, index) => (
                            <tr key={index} className="border-b border-gray-800">
                                <td>{item.part}</td>
                                <td>{item.type}</td>
                                <td>
                                    <Progress value={item.area} className="w-32 bg-gray-700" />
                                    <p className="text-xs mt-1">{item.area.toFixed(2)}%</p>
                                </td>
                                <td>
                                    <span className={`px-3 py-1 rounded-md text-xs font-bold ${item.recommend === "replace" ? "bg-red-500" : "bg-green-500"}`}>
                                        {item.recommend.toUpperCase()}
                                    </span>
                                </td>
                                <td>${item.cost}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-between mt-6">
                <button onClick={() => router.back()} className="bg-orange-500 px-6 py-2 rounded-md text-white font-bold hover:bg-orange-600 transition">
                    Back
                </button>
                <button onClick={handleSave} className="bg-blue-500 px-6 py-2 rounded-md text-white font-bold hover:bg-blue-600 transition">
                    Save Data
                </button>
            </div>
        </div>
    );
}
