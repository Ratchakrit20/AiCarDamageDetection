"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function InsuranceRegisterForm() {
  const { data: session } = useSession();
  const [formData, setFormData] = useState({
    policy_number: "",
    insurance_type: "Full Coverage",
    policy_start_date: "",
    policy_end_date: "",
    car_brand: "",
    car_model: "",
    car_year: 2023,
    license_plate: "",
    claim_limit: 50000,
    coverage_details: "",
  });

  const [status, setStatus] = useState("");
  const [submittedRequests, setSubmittedRequests] = useState([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?._id) return;

    try {
      const res = await fetch("/api/insurance/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: session.user._id, insurance: formData }),
      });

      const data = await res.json();
      if (res.ok) {
        setStatus("\u2705 ส่งคำขอเรียบร้อยแล้ว รอแอดมินตรวจสอบ");
        fetchSubmittedRequests();
      } else {
        setStatus(`\u274C ${data.message}`);
      }
    } catch (err) {
      console.error(err);
      setStatus("\u274C เกิดข้อผิดพลาด");
    }
  };

  const fetchSubmittedRequests = async () => {
    if (!session?.user?._id) return;
    try {
      const res = await fetch(`/api/insurance/my-requests?userId=${session.user._id}`);
      const data = await res.json();
      setSubmittedRequests(data.data || []);
    } catch (err) {
      console.error("Error fetching requests", err);
    }
  };

  useEffect(() => {
    fetchSubmittedRequests();
  }, [session]);

  return (
    <div className="max-w-3xl mx-auto mt-10">
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow">
        <h2 className="text-xl font-bold mb-4">ลงทะเบียนข้อมูลประกัน</h2>

        <input type="text" name="policy_number" value={formData.policy_number} onChange={handleChange} placeholder="Policy Number" className="w-full border p-2 rounded" required />

        <select name="insurance_type" value={formData.insurance_type} onChange={handleChange} className="w-full border p-2 rounded">
          <option value="Full Coverage">Full Coverage</option>
          <option value="Third Party">Third Party</option>
          <option value="Other">Other</option>
        </select>

        <div className="flex gap-2">
          <input type="date" name="policy_start_date" value={formData.policy_start_date} onChange={handleChange} className="flex-1 border p-2 rounded" required />
          <input type="date" name="policy_end_date" value={formData.policy_end_date} onChange={handleChange} className="flex-1 border p-2 rounded" required />
        </div>

        <div className="flex gap-2">
          <input type="text" name="car_brand" value={formData.car_brand} onChange={handleChange} placeholder="Brand" className="flex-1 border p-2 rounded" required />
          <input type="text" name="car_model" value={formData.car_model} onChange={handleChange} placeholder="Model" className="flex-1 border p-2 rounded" required />
          <input type="number" name="car_year" value={formData.car_year} onChange={handleChange} placeholder="Year" className="w-24 border p-2 rounded" required />
        </div>

        <input type="text" name="license_plate" value={formData.license_plate} onChange={handleChange} placeholder="License Plate" className="w-full border p-2 rounded" required />
        <input type="number" name="claim_limit" value={formData.claim_limit} onChange={handleChange} placeholder="Claim Limit" className="w-full border p-2 rounded" required />

        <textarea name="coverage_details" value={formData.coverage_details} onChange={handleChange} placeholder="Coverage Details" className="w-full border p-2 rounded" rows={3}></textarea>

        <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">ส่งคำขอ</button>
        {status && <p className="text-sm text-center mt-2">{status}</p>}
      </form>

      <div className="bg-white mt-8 p-6 shadow rounded">
        <h3 className="font-semibold mb-4">คำขอของคุณ</h3>
        {submittedRequests.length === 0 ? (
          <p className="text-gray-500 text-sm">ยังไม่มีคำขอ</p>
        ) : (
          <ul className="text-sm space-y-2">
            {submittedRequests.map((req: any) => (
              <li key={req._id} className="border p-3 rounded">
                <p><strong>เลขกรมธรรม์:</strong> {req.policy_number}</p>
                <p><strong>ยี่ห้อ:</strong> {req.car_brand} | <strong>รุ่น:</strong> {req.car_model}</p>
                <p><strong>สถานะ:</strong> <span className={`font-medium ${req.status === "approved" ? "text-green-600" : req.status === "rejected" ? "text-red-500" : "text-yellow-500"}`}>{req.status}</span></p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
