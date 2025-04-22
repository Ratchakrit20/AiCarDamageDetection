"use client";
import { useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";

export default function RegisterOwnershipPage() {
  const { data: session } = useSession();
  const [policyNumber, setPolicyNumber] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [status, setStatus] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post<{ message: string }>("/api/insurance/request", {
        policy_number: policyNumber,
        owner_firstname: firstName,
        owner_lastname: lastName,
        user_id: session?.user?.id,
      });
      setStatus(res.data.message);
     
    } catch (err: any) {
      setStatus(err?.response?.data?.message || "เกิดข้อผิดพลาด");
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto text-white">
      <h2 className="text-2xl font-bold mb-4">ยืนยันตัวตนเจ้าของประกัน</h2>
      <form onSubmit={handleSubmit} className="space-y-4 bg-[#26194d] p-4 rounded">
        <input
          type="text"
          placeholder="เลขกรมธรรม์ (Policy Number)"
          value={policyNumber}
          onChange={(e) => setPolicyNumber(e.target.value)}
          className="w-full p-2 rounded bg-gray-900"
          required
        />
        <input
          type="text"
          placeholder="ชื่อเจ้าของ"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="w-full p-2 rounded bg-gray-900"
          required
        />
        <input
          type="text"
          placeholder="นามสกุลเจ้าของ"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="w-full p-2 rounded bg-gray-900"
          required
        />
        <button type="submit" className="bg-green-600 px-4 py-2 rounded">
          ส่งคำขอยืนยัน
        </button>
        <p className="mt-2">{status}</p>
      </form>
    </div>
  );
}
