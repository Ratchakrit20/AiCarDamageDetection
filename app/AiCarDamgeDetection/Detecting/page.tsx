"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import Image from "next/image";
import Navbar from '../../components/Navbar';
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import { v4 as uuidv4 } from 'uuid'; // แนะนำให้ใช้ UUID
import { useRouter } from 'next/navigation';  // สำหรับ Next.js 13+ และ 14


interface DetectionResult {
  part_name: string;
  damages: DamageInfo[];
  car_brand?: string;
  car_model?: string;
  car_year?: number;
  license_plate?: string;
  color?: string;
}

interface User {
  _id: string;
  username: string;
  email: string;
  password: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

interface DamageInfo {
  damage_name: string;
  overlap_ratio: number;
}

interface DetectionResult {
  part_name: string;
  damages: DamageInfo[];
}

interface APIResponse {
  car_brand?: string;
  car_model?: string;
  car_year?: number;
  license_plate?: string;
  results: {
    result: {
      detection_results: DetectionResult[];
      output_image_base64: string;
    };
  }[];
}

interface DamageData {
  part_name: string;
  overlap_ratio: number;
  color?: string;
  damages: DamageInfo[];
  recommend?: "REPAIR" | "REPLACE";
  cost?: number;
}


interface PricingResponse {
  success: boolean;
  parts: {
    _id: string;
    part_id: number;
    name: string;
    price: { $numberDecimal: string } | number;
    repair: { $numberDecimal: string } | number;
    last_updated: string;
  }[];
}
const positions = ["Left", "Right", "Front", "Back"];


export default function CarDetect() {

  const { data: session, status } = useSession(); // ✅ ดึง session
  const userId = session?.user?.id; // ✅ ตรวจสอบ userId
  const [damageData, setDamageData] = useState<DamageData[]>([]);
  const [results, setResults] = useState<APIResponse[]>([]); // เก็บผลลัพธ์สำหรับแต่ละรูปภาพ
  const router = useRouter();
  const [pricingData, setPricingData] = useState<PricingResponse['parts']>([]);
  const positions = ["Left", "Right", "Front", "Back"];

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const { data } = await axios.get<PricingResponse>('/api/admin/parts-pricing');
        const pricingData = data.parts;

        const updatedDamageData = damageData.map((damage) => {
          const pricing = pricingData.find((p) => p.name.trim() === damage.part_name.trim());
          const isReplace = damage.overlap_ratio > 50;

          const cost = isReplace
            ? parseFloat(
              typeof pricing?.price === 'number'
                ? pricing.price.toString()
                : pricing?.price.$numberDecimal || '0'
            )
            : parseFloat(
              typeof pricing?.repair === 'number'
                ? pricing.repair.toString()
                : pricing?.repair.$numberDecimal || '0'
            );

          return {
            ...damage,
            recommend: (isReplace ? "REPLACE" : "REPAIR") as "REPAIR" | "REPLACE",
            cost,
          };
        });

        setDamageData(updatedDamageData);
      } catch (error) {
        console.error("Error fetching pricing data:", error);
      }
    };

    if (damageData.length > 0 && !damageData[0].cost) {
      fetchPrices();
    }
  }, [damageData]); // ✅ เรียกเมื่อ damageData เปลี่ยน และยังไม่มี cost
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchPrices();
        setPricingData(data.parts);
      } catch (error) {
        console.error("Error fetching pricing data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (results.length > 0 && results[0]?.results?.[0]?.result?.detection_results) {
      const tempData = results[0].results[0].result.detection_results.map((damage) => ({
        part_name: damage.part_name.trim(),
        overlap_ratio: Math.max(...(damage.damages ?? []).map((d) => d.overlap_ratio), 0) * 100,
        color: damage.color || "#999999",
        damages: damage.damages ?? [],
      }));

      // รวมข้อมูลซ้ำกัน
      const combinedDamageData = Object.values(
        tempData.reduce((acc, curr) => {
          if (!acc[curr.part_name]) {
            acc[curr.part_name] = curr;
          } else {
            // เลือกค่า overlap_ratio ที่มากที่สุด
            acc[curr.part_name].overlap_ratio = Math.max(
              acc[curr.part_name].overlap_ratio,
              curr.overlap_ratio
            );
            // รวม damages ที่ไม่ซ้ำกัน
            acc[curr.part_name].damages = Array.from(
              new Map(
                [...acc[curr.part_name].damages, ...curr.damages].map((item) => [
                  item.damage_name,
                  item,
                ])
              ).values()
            );
          }
          return acc;
        }, {} as Record<string, DamageData>)
      );

      setDamageData(combinedDamageData);
    } else {
      setDamageData([]);
    }
  }, [results]);


  const [activeTab, setActiveTab] = useState("single");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFileMultiple, setSelectedFileMultiple] = useState<(File | null)[]>(Array(4).fill(null));
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [originalImages, setOriginalImages] = useState<(string | null)[]>(Array(4).fill(null)); // เก็บ URL ของรูปภาพต้นฉบับ

  const handleTabSwitch = (tab: string) => {
    setActiveTab(tab);
    setSelectedFile(null);
    setSelectedFileMultiple(Array(4).fill(null));
    setResults([]); // ✅ รีเซ็ต results
    setDamageData([]); // ✅ รีเซ็ต damageData
    setOriginalImages(Array(4).fill(null)); // รีเซ็ตรูปภาพต้นฉบับเมื่อเปลี่ยนแท็บ
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setOriginalImages([URL.createObjectURL(file), ...Array(3).fill(null)]);
    }
  };

  const handleFileMultipleChange = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const newFiles = [...selectedFileMultiple];
    newFiles[index] = files[0];
    setSelectedFileMultiple(newFiles);

    const newOriginalImages = [...originalImages];
    newOriginalImages[index] = URL.createObjectURL(files[0]);
    setOriginalImages(newOriginalImages);
  };
  const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();

    if (res.ok) {
      return data.url;
    } else {
      throw new Error(data.error || 'Failed to upload image');
    }
  };

  const handleSubmit = async () => {
    if (!userId) {
      alert("❌ User ID not found. Please login again.");
      return;
    }

    const formData = new FormData();

    if (activeTab === "single") {
      if (!selectedFile) {
        alert("❌ Please upload an image before calculating.");
        return;
      }


      const imageUrl = await uploadImage(selectedFile);
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const uploadedFile = new File([blob], selectedFile.name, { type: selectedFile.type });

      formData.append("images", uploadedFile);
      setOriginalImages([imageUrl, ...Array(3).fill(null)]);

    } else {
      const newOriginalImages: string[] = [];

      for (const file of selectedFileMultiple) {
        if (file) {
          const imageUrl = await uploadImage(file);
          newOriginalImages.push(imageUrl);

          const response = await fetch(imageUrl);
          const blob = await response.blob();
          const uploadedFile = new File([blob], file.name, { type: file.type });

          formData.append("images", uploadedFile);
        }
      }
      setOriginalImages([...newOriginalImages]);
    }

    await sendFormData(formData, userId);
  };


  const fetchUserInsurance = async () => {
    try {
      const res = await fetch(`/api/user/getUserInsurance`, { credentials: "include" });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to fetch user insurance");

      console.log("✅ Insurance Data:", data.insurance); // 🔹 ตรวจสอบข้อมูลรถ
      return data.insurance;
    } catch (error) {
      console.error("❌ Fetch Insurance Error:", error);
      return null;
    }
  };

  const sendFormData = async (formData: FormData, userId: string) => {
    try {
      setLoading(true);

      const carDetails = await fetchUserInsurance();

      const response = await axios.post<APIResponse>(
        "https://b69f-34-125-86-59.ngrok-free.app/detect_damage_all/",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (!response.data.results || response.data.results.length === 0) {
        return;
      }

      const newDamageData = [
        ...new Map(
          response.data.results[0].result.detection_results.map((damage) => [
            damage.part_name,
            {
              part_name: damage.part_name,
              overlap_ratio: Math.max(...(damage.damages ?? []).map((d) => d.overlap_ratio), 0) * 100,
              color: damage.color || "#999999",
              damages: damage.damages ?? [],
            },
          ])
        ).values(),
      ];

      setDamageData(newDamageData);

      const updatedResults: APIResponse[] = response.data.results.map((result) => ({
        car_brand: carDetails?.car_brand || "Unknown",
        car_model: carDetails?.car_model || "Unknown",
        car_year: carDetails?.car_year || 0,
        license_plate: carDetails?.license_plate || "Unknown",
        results: [
          {
            result: {
              detection_results: result.result.detection_results,
              output_image_base64: result.result.output_image_base64,
            },
          },
        ],
      }));


      setResults(updatedResults);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleSaveReport = async () => {
    if (!session?.user?.id) {
      alert("Please login again.");
      return;
    }

    try {
      // อัปโหลดรูปภาพที่ประมวลผลแล้ว
      const processedImageUrls = await Promise.all(
        results.map(async (result, index) => {
          const base64Image = `data:image/jpeg;base64,${result.results[0].result.output_image_base64}`;
          const fileName = `processed_image_${index + 1}.jpg`;
          return await uploadProcessedImage(base64Image, fileName);
        })
      );

      // สร้างรายงาน
      const reportData = {
        report_id: uuidv4(),
        user_id: session.user.id,
        car_info: {
          brand: results[0]?.car_brand || "Unknown",
          model: results[0]?.car_model || "Unknown",
          year: results[0]?.car_year?.toString() || "Unknown",
        },
        images: [
          ...originalImages.filter(Boolean), // รูปภาพต้นฉบับ
          ...processedImageUrls, // รูปภาพที่ประมวลผลแล้ว
        ],
        damages: damageData.map((dmg) => ({
          damage_part: dmg.part_name,
          detected_type: dmg.damages.map(d => d.damage_name).join(", "),
          damage_area: parseFloat(dmg.overlap_ratio.toFixed(2)),
          confidence: parseFloat(dmg.overlap_ratio.toFixed(2)),
          action_required: (dmg.recommend ?? "repair").toLowerCase() as "repair" | "replace",
          cost: dmg.cost || 0,
        })),
        total_cost: damageData.reduce((total, curr) => total + (curr.cost || 0), 0),
      };

      // บันทึกรายงาน
      await axios.post('/api/saveDamageReport', reportData);
      alert('Report saved successfully.');

      window.location.reload();
    } catch (error) {
      console.error('Failed to save report:', error);
      alert('Failed to save report.');
    }
  };

  const uploadProcessedImage = async (base64Image: string, fileName: string): Promise<string> => {
    try {
      const response = await fetch(base64Image);
      const blob = await response.blob();
      const file = new File([blob], fileName, { type: "image/jpeg" });

      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        return data.url; // URL ของรูปภาพที่อัปโหลด
      } else {
        throw new Error(data.error || 'Failed to upload processed image');
      }
    } catch (error) {
      console.error("Error uploading processed image:", error);
      throw error;
    }
  };
  const fetchPrices = async (): Promise<PricingResponse> => {
    try {
      const { data } = await axios.get<PricingResponse>('/api/admin/parts-pricing');
      return data;
    } catch (error) {
      console.error("Error fetching pricing data:", error);
      throw error; // หรือส่งคืนค่าเริ่มต้นหากจำเป็น
    }
  };

  return (
    <div>
      <Navbar />
      <div className="p-3  text-white flex justify-center items-center">
        <div className="w-[700px] p-6 bg-[#160f26] rounded-lg shadow-lg">
          {/* Tabs for Single Image and Multiple Image */}
          <div className="flex mb-4 bg-[#ffffffb0] p-1 rounded-full">
            <button
              className={`flex-1 m-1 py-2 px-4 rounded-full ${activeTab === "single" ? "bg-[#5e17eb] text-white" : "bg-gray-700 text-gray-400"
                }`}
              onClick={() => handleTabSwitch("single")}
            >
              Single Image
            </button>
            <button
              className={`flex-1 m-1 py-2 px-4 rounded-full ${activeTab === "multiple" ? "bg-[#5e17eb] text-white" : "bg-gray-700 text-gray-400"
                }`}
              onClick={() => handleTabSwitch("multiple")}
            >
              Multiple Image
            </button>
          </div>

          {/* Drop Zone */}
          {activeTab === "single" ? (
            <div className="w-full h-[200px] bg-[#45287e42] rounded-lg flex flex-col justify-center items-center text-white border-2  border-[#5e17eb] hover:border-[#5e17eb7c]">
              <label className="cursor-pointer flex flex-col items-center">
                <span className="text-2xl"></span>
                {selectedFile ? selectedFile.name : "Single Car Damaged Image"}
                <p className="text-sm">File should not exceed 5 MB</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {selectedFileMultiple.map((file, index) => {
                const position = positions[index]; // ประกาศและกำหนดค่า

                return (
                  <div key={index} className="relative w-full h-[150px] bg-[#45287e42] rounded-lg  flex-col  text-white border-2  border-[#5e17eb] hover:border-[#5e17eb7c] flex items-center justify-center">
                    <label className="cursor-pointer flex flex-col items-center">
                      <span className="text-2xl"></span>
                      <p className="text-sm text-gray-400">Upload Image: {position}</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileMultipleChange(e, index)}
                        className="hidden"
                      />
                    </label>
                  </div>
                );
              })}
            </div>
          )}

          {/* Calculate Button */}
          <div className="mt-6">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-[#5e17eb] hover:bg-[#5e17eb6b] text-white py-2 px-4 rounded-lg font-semibold"
            >
              {loading ? "Calculating..." : "Calculate"}
            </button>
          </div>

          {/* Result Display */}
          {results.length > 0 && (

            <div className="mt-3">
              {results.length > 0 && activeTab === "single" && (
                <div>
                  {/* Car Details Section */}
                  <div className="flex">
                    <div className="w-full p-3 text-white text-sm">
                      <div className="p-3 bg-[#2a1b4d] rounded-lg border border-[#4a3a7d]">
                        <h3 className="text-lg text-center font-bold text-purple-100">Car Details</h3>
                        <div className="grid grid-cols-2 gap-2 mt-4">
                          <p><strong className="text-purple-200">Brand:</strong> {results[0]?.car_brand || "Unknown"}</p>
                          <p><strong className="text-purple-200">Model:</strong> {results[0]?.car_model || "Unknown"}</p>
                          <p><strong className="text-purple-200">Year:</strong> {results[0]?.car_year || 0}</p>
                          <p><strong className="text-purple-200">License Plate:</strong> {results[0]?.license_plate || "Unknown"}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Summary of Damage Section */}
                  <div className="p-3 text-white">
                    <h3 className="text-lg text-center font-bold text-purple-100 mb-4">Summary of Damage</h3>

                    {damageData.length > 0 && (
                      <div className="bg-[#2a1b4d] rounded-lg border border-[#4a3a7d] p-4 flex flex-col md:flex-row items-center justify-between">
                        {/* Pie Chart */}
                        <div className="mb-4 md:mb-0">
                          <PieChart width={180} height={180}>
                            <Pie
                              data={damageData}
                              innerRadius={50}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="overlap_ratio"
                            >
                              {damageData.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={entry.color}
                                  className="border-2 border-[#4a3a7d]"
                                />
                              ))}
                            </Pie>
                            <Tooltip
                              formatter={(value) => [`${value}%`, "Damage Ratio"]}
                              contentStyle={{
                                backgroundColor: '#2a1b4d',
                                borderColor: '#4a3a7d',
                                borderRadius: '8px',
                                color: 'white'
                              }}
                            />
                          </PieChart>
                        </div>

                        {/* Damage Details */}
                        <div className="w-full md:w-auto">
                          <div className="p-4  rounded-lg  ">
                            <h3 className="text-center font-bold text-purple-100 mb-3">Damage Details</h3>
                            <div className="space-y-2">
                              {damageData.map((damage, index) => (
                                <div key={index} className="flex items-center justify-between">
                                  <span
                                    className="px-3 py-1 rounded-full text-xs font-bold flex items-center"
                                    style={{
                                      backgroundColor: damage.color,
                                      color: '#000'
                                    }}
                                  >
                                    <span className="w-2 h-2 rounded-full bg-black/30 mr-2"></span>
                                    {damage.part_name}
                                  </span>
                                  <span className="text-white font-medium ml-4">
                                    {damage.overlap_ratio.toFixed(1)}%
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Image Comparison Section */}
                  <div className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Original Image */}
                      <div className="bg-[#2a1b4d] rounded-xl border border-[#4a3a7d] overflow-hidden">
                        <div className="bg-[#4a3a7d] p-3 border-b border-[#4a3a7d]">
                          <h3 className="font-semibold text-purple-100 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Original Image
                          </h3>
                        </div>
                        <div className="p-4 flex justify-center">
                          {originalImages[0] && (
                            <div className="relative w-full h-64">
                              <Image
                                src={originalImages[0]}
                                alt="Original Image"
                                fill
                                className="object-contain rounded"
                                priority
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Processed Image */}
                      <div className="bg-[#2a1b4d] rounded-xl border border-[#4a3a7d] overflow-hidden">
                        <div className="bg-[#4a3a7d] p-3 border-b border-[#4a3a7d]">
                          <h3 className="font-semibold text-purple-100 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                            </svg>
                            Damage Analysis
                          </h3>
                        </div>
                        <div className="p-4 flex justify-center">
                          {results[0].results[0].result.output_image_base64 && (
                            <div className="relative w-full h-64">
                              <Image
                                src={`data:image/jpeg;base64,${results[0].results[0].result.output_image_base64}`}
                                alt="Processed Image"
                                fill
                                className="object-contain rounded"
                                priority
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Detection Results Table */}
                  <div className="mt-8">
                    <div className="bg-[#2a1b4d] rounded-xl border border-[#4a3a7d] overflow-hidden">
                      <div className="p-4 bg-[#4a3a7d]">
                        <h3 className="text-xl font-bold text-purple-100 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          Detection Results
                        </h3>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-[#4a3a7d] text-purple-100">
                              <th className="py-3 px-4 text-left rounded-tl-lg">Damaged Part</th>
                              <th className="py-3 px-4 text-left">Damage Types</th>
                              <th className="py-3 px-4 text-left">Damage Area</th>
                              <th className="py-3 px-4 text-left">Action</th>
                              <th className="py-3 px-4 text-right rounded-tr-lg">Cost</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#3a2a6d]">
                            {damageData.map((damage, idx) => (
                              <tr key={idx} className="hover:bg-[#4a3a7d]/50 transition">
                                {/* Damaged Part */}
                                <td className="py-4 px-4">
                                  <div className="flex items-center">
                                    <div
                                      className="w-3 h-3 rounded-full mr-3 border border-white/30"
                                      style={{ backgroundColor: damage.color || "#999999" }}
                                    ></div>
                                    <span className="font-medium text-white">{damage.part_name}</span>
                                  </div>
                                </td>

                                {/* Damage Types */}
                                <td className="py-4 px-4">
                                  <div className="flex flex-wrap gap-2">
                                    {damage.damages.map((d, i) => (
                                      <span
                                        key={i}
                                        className="bg-[#2e2649] border-2 text-white border-[#5e17eb] text-xs px-2 py-1 rounded-full"
                                      >
                                        {d.damage_name}
                                      </span>
                                    ))}
                                  </div>
                                </td>

                                {/* Damage Area */}
                                <td className="py-4 px-4">
                                  <div className="flex items-center">
                                    <div className="relative w-28 h-3 bg-[#4a3a7d] rounded-full overflow-hidden">
                                      <div
                                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-yellow-400 to-red-500 rounded-full"
                                        style={{ width: `${damage.overlap_ratio}%` }}
                                      ></div>
                                      <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white z-10">
                                        {damage.overlap_ratio.toFixed(1)}%
                                      </span>
                                    </div>
                                  </div>
                                </td>

                                {/* Recommendation */}
                                <td className="py-4 px-4">
                                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${damage.recommend === "REPLACE"
                                      ? "bg-red-500/20 text-red-400"
                                      : "bg-green-500/20 text-green-400"
                                    }`}>
                                    {damage.recommend}
                                  </span>
                                </td>

                                {/* Cost */}
                                <td className="py-4 px-4 text-right font-bold text-white">
                                  {damage.cost?.toLocaleString('en-US', {
                                    style: 'currency',
                                    currency: 'THB',
                                    minimumFractionDigits: 0
                                  }) || '฿0'}
                                </td>
                              </tr>
                            ))}
                          </tbody>

                          {/* Total Cost */}
                          <tfoot>
                            <tr className="bg-[#4a3a7d]">
                              <td colSpan={4} className="py-3 px-4 text-right font-bold text-purple-100">
                                Total Cost:
                              </td>
                              <td className="py-3 px-4 text-right font-bold text-white">
                                {damageData.reduce((total, curr) => total + (curr.cost || 0), 0).toLocaleString('en-US', {
                                  style: 'currency',
                                  currency: 'THB',
                                  minimumFractionDigits: 0
                                })}
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {results.length > 0 && activeTab === "multiple" && (
                <div>

<div className="flex">
                    <div className="w-full p-3 text-white text-sm">
                      <div className="p-3 bg-[#2a1b4d] rounded-lg border border-[#4a3a7d]">
                        <h3 className="text-lg text-center font-bold text-purple-100">Car Details</h3>
                        <div className="grid grid-cols-2 gap-2 mt-4">
                          <p><strong className="text-purple-200">Brand:</strong> {results[0]?.car_brand || "Unknown"}</p>
                          <p><strong className="text-purple-200">Model:</strong> {results[0]?.car_model || "Unknown"}</p>
                          <p><strong className="text-purple-200">Year:</strong> {results[0]?.car_year || 0}</p>
                          <p><strong className="text-purple-200">License Plate:</strong> {results[0]?.license_plate || "Unknown"}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ✅ Summary of Damage รวมข้อมูลจากทั้ง 4 รูป */}
                  <div className="flex p-3 text-white items-center justify-center text-center">
                    <h3 className="text-lg text-center font-bold text-purple-100 mb-4"><strong>Summary of Damage</strong></h3>
                  </div>
                  {damageData.length > 0 && (
                    <div className=" bg-[#2a1b4d] rounded-lg border border-[#4a3a7d] p-4 flex flex-col md:flex-row items-center justify-between">
                      <div>
                        <PieChart width={180} height={180}>
                          <Pie
                            data={Array.from(
                              results.reduce((acc, result) => {
                                result.results[0].result.detection_results.forEach((damage) => {
                                  const partName = damage.part_name.trim();
                                  const overlapRatio = Math.max(...(damage.damages ?? []).map((d) => d.overlap_ratio), 0) * 100;
                                  const color = damage.color || "#999999";

                                  if (!acc.has(partName)) {
                                    acc.set(partName, {
                                      part_name: partName,
                                      overlap_ratio: overlapRatio, // แก้ไขตรงนี้
                                      color,
                                    });
                                  } else {
                                    // ถ้ามี part_name ซ้ำ ให้เลือก overlap_ratio ที่มากที่สุด
                                    const existing = acc.get(partName);
                                    if (existing && overlapRatio > existing.overlap_ratio) {
                                      acc.set(partName, {
                                        ...existing,
                                        overlap_ratio: overlapRatio, // แก้ไขตรงนี้
                                      });
                                    }
                                  }
                                });
                                return acc;
                              }, new Map<string, { part_name: string; overlap_ratio: number; color: string }>())
                            ).map(([_, value]) => value)}
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="overlap_ratio" // แก้ไขตรงนี้
                          >
                            {Array.from(
                              results.reduce((acc, result) => {
                                result.results[0].result.detection_results.forEach((damage) => {
                                  const partName = damage.part_name.trim();
                                  const color = damage.color || "#999999";
                                  acc.set(partName, color);
                                });
                                return acc;
                              }, new Map<string, string>())
                            ).map(([partName, color], index) => (
                              <Cell key={`cell-${index}`} fill={color} className="border-2 border-black" />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </div>
                      {/* รายละเอียดความเสียหาย */}
                      <div>
                        <div className="p-5 rounded-lg">
                          <h3 className="flex items-center justify-center text-center text-white">
                            <strong>Damage Details</strong>
                          </h3>
                          <br />
                          {Array.from(
                            results.reduce((acc, result) => {
                              result.results[0].result.detection_results.forEach((damage) => {
                                const partName = damage.part_name.trim();
                                const overlapRatio = Math.max(...(damage.damages ?? []).map((d) => d.overlap_ratio), 0) * 100;
                                const color = damage.color || "#999999";

                                if (!acc.has(partName)) {
                                  acc.set(partName, {
                                    part_name: partName,
                                    overlap_ratio: overlapRatio,
                                    color,
                                  });
                                } else {
                                  // ถ้ามี part_name ซ้ำ ให้เลือก overlap_ratio ที่มากที่สุด
                                  const existing = acc.get(partName);
                                  if (existing && overlapRatio > existing.overlap_ratio) {
                                    acc.set(partName, {
                                      ...existing,
                                      overlap_ratio: overlapRatio, // แก้ไขตรงนี้
                                    });
                                  }
                                }
                              });
                              return acc;
                            }, new Map<string, { part_name: string; overlap_ratio: number; color: string }>())
                          ).map(([_, value]) => (
                            <div key={value.part_name} className="flex py-1 items-center justify-between">
                              <span
                                className="px-2 py-1 border border-gray-400 rounded-full text-xs font-semibold"
                                style={{ backgroundColor: value.color }}
                              >
                                <div className="text-black font-bold">{value.part_name}</div>
                              </span>
                              <span className="px-5 text-sm text-white">{value.overlap_ratio.toFixed(2)}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  {/* ✅ แสดงผลลัพธ์สำหรับแต่ละรูปภาพ */}
                  {results.map((result, index) => {
                    const position = positions[index]; // ประกาศและกำหนดค่า
                    const damageData = result.results[0].result.detection_results.map((damage) => {
                      const overlapRatio = Math.max(...(damage.damages ?? []).map((d) => d.overlap_ratio), 0) * 100;
                      const recommend = overlapRatio > 50 ? "REPLACE" : "REPAIR";

                      // ค้นหาราคาอะไหล่จาก pricingData
                      const pricing = pricingData.find((p) => p.name.trim() === damage.part_name.trim());
                      const isReplace = overlapRatio > 50;

                      const cost = isReplace
                        ? parseFloat(
                          typeof pricing?.price === 'number'
                            ? pricing.price.toString()
                            : pricing?.price.$numberDecimal || '0'
                        )
                        : parseFloat(
                          typeof pricing?.repair === 'number'
                            ? pricing.repair.toString()
                            : pricing?.repair.$numberDecimal || '0'
                        );

                      return {
                        part_name: damage.part_name.trim(),
                        overlap_ratio: overlapRatio,
                        color: damage.color || "#999999",
                        damages: damage.damages ?? [],
                        recommend,
                        cost,
                      };
                    });
                    const totalCostForImage = damageData.reduce((total, curr) => total + (curr.cost || 0), 0);
                    return (
                      <div key={index} className="mt-10 bg-[#2a1b4d] rounded-xl shadow-lg overflow-hidden">
                        {/* Image Comparison Section */}
                        <div className="p-6">
                          <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {position} View Analysis
                          </h3>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                            {/* Original Image Card */}
                            <div className="bg-[#3a2a6d] rounded-lg overflow-hidden border border-[#4a3a7d]">
                              <div className=" bg-[#4a3a7d] border-b border-[#4a3a7d]">
                                <h4 className="font-semibold text-purple-100 flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  Original Image
                                </h4>
                              </div>
                              <div className="p-2  flex justify-center">
                                {originalImages[index] && (
                                  <div className="relative w-full h-64">
                                    <Image
                                      src={originalImages[index]}
                                      alt="Original Image"
                                      fill
                                      className="object-contain rounded"
                                      priority
                                    />
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Processed Image Card */}
                            <div className="bg-[#3a2a6d] rounded-lg overflow-hidden border border-[#4a3a7d]">
                              <div className=" bg-[#4a3a7d] border-b border-[#4a3a7d]">
                                <h4 className="font-semibold text-purple-100 flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                                  </svg>
                                  Damage Analysis
                                </h4>
                              </div>
                              <div className="p-2 flex justify-center">
                                {result.results[0].result.output_image_base64 && (
                                  <div className="relative w-full h-64">
                                    <Image
                                      src={`data:image/jpeg;base64,${result.results[0].result.output_image_base64}`}
                                      alt="Processed Image"
                                      fill
                                      className="object-contain rounded"
                                      priority
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Damage Results Table */}
                        <div className="p-6 pt-0">
                          <div className="overflow-x-auto">
                            <table className="w-full border-collapse ">
                              <thead>
                                <tr className="bg-[#4a3a7d] text-purple-100 ">
                                  <th className="py-3 px-4 text-left rounded-tl-lg">Damaged Part</th>
                                  <th className="py-3 px-4 text-left">Damage Types</th>
                                  <th className="py-3 px-4 text-left">Severity</th>
                                  <th className="py-3 px-4 text-left">Action</th>
                                  <th className="py-3 px-4 text-right rounded-tr-lg">Cost</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-[#3a2a6d]">
                                {damageData.map((damage, idx) => (
                                  <tr key={idx} className="hover:bg-[#4a3a7d]/50 transition">
                                    {/* Damaged Part */}
                                    <td className="py-4 px-4">
                                      <div className="flex items-center">
                                        <div
                                          className="w-3 h-3 rounded-full mr-3 border border-white/30"
                                          style={{ backgroundColor: damage.color || "#999999" }}
                                        ></div>
                                        <span className="font-medium text-white">{damage.part_name}</span>
                                      </div>
                                    </td>

                                    {/* Damage Types */}
                                    <td className=" border-b border-[#4a3a7d]/50  p-3">
                                      <div className="flex flex-wrap gap-2 justify-center">
                                        {damage.damages.map((d, i) => (
                                          <span
                                            key={i}
                                            className="bg-[#2e2649] border-2 text-white border-[#5e17eb] text-[10px] px-1 rounded-full"
                                          >
                                            {d.damage_name}
                                          </span>
                                        ))}
                                      </div>
                                    </td>

                                    {/* Damage Area */}
                                    <td className="py-4 px-4">
                                      <div className="flex items-center">
                                        <div className="relative w-28 h-3 bg-[#4a3a7d] rounded-full overflow-hidden">
                                          <div
                                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-yellow-400 to-red-500 rounded-full"
                                            style={{ width: `${damage.overlap_ratio}%` }}
                                          ></div>
                                          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold text-white z-10">
                                            {damage.overlap_ratio.toFixed(1)}%
                                          </span>
                                        </div>
                                      </div>
                                    </td>


                                    {/* Recommendation */}
                                    <td className="py-4 px-4">
                                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${damage.recommend === "REPLACE"
                                        ? "bg-red-500/20 text-red-400"
                                        : "bg-green-500/20 text-green-400"
                                        }`}>
                                        {damage.recommend}
                                      </span>
                                    </td>

                                    {/* Cost */}
                                    <td className="py-4 px-4 text-right font-bold text-white">
                                      {damage.cost?.toLocaleString('en-US', {
                                        style: 'currency',
                                        currency: 'THB',
                                        minimumFractionDigits: 0
                                      }) || '฿0'}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>

                              {/* Total Cost */}
                              <tfoot>
                                <tr className="bg-[#4a3a7d]">
                                  <td colSpan={4} className="py-3 px-4 text-right font-bold text-purple-100">
                                    Total Cost:
                                  </td>
                                  <td className="py-3 px-4 text-right font-bold text-white">
                                    {damageData.reduce((total, curr) => total + (curr.cost || 0), 0).toLocaleString('en-US', {
                                      style: 'currency',
                                      currency: 'THB',
                                      minimumFractionDigits: 0
                                    })}
                                  </td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>
                        </div>
                      </div>
                    );


                  })}
                </div>
              )}
              <div className="mt-6 text-right font-bold text-white">
                Overall Total Cost: {results.reduce((total, result, index) => {
                  const damageData = result.results[0].result.detection_results.map((damage) => {
                    const pricing = pricingData.find((p) => p.name.trim() === damage.part_name.trim());
                    const isReplace = Math.max(...(damage.damages ?? []).map((d) => d.overlap_ratio), 0) * 100 > 50;

                    return isReplace
                      ? parseFloat(
                        typeof pricing?.price === 'number'
                          ? pricing.price.toString()
                          : pricing?.price.$numberDecimal || '0'
                      )
                      : parseFloat(
                        typeof pricing?.repair === 'number'
                          ? pricing.repair.toString()
                          : pricing?.repair.$numberDecimal || '0'
                      );
                  });

                  return total + damageData.reduce((sum, cost) => sum + cost, 0);
                }, 0).toFixed(0)} ฿
              </div>
              <button
                className="w-full mt-4 bg-[#5e17eb] text-white py-2 px-4 rounded-lg"
                onClick={handleSaveReport}
              >
                Save Report
              </button>
            </div>

          )}

        </div>

      </div>
    </div>
  );
}