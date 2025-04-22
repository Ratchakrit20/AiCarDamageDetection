"use client";

import { useEffect, useState } from "react";
import axios from "axios";

interface InsuranceRequest {
  _id: string;
  user_id: string;
  policy_number: string;
  status: "pending" | "approved" | "rejected";
  request_date: string;
}

export default function ApproveInsurancePage() {
  const [requests, setRequests] = useState<InsuranceRequest[]>([]);

  const fetchRequests = async () => {
    const res = await axios.get<InsuranceRequest[]>("/api/admin/insurance-requests");
    setRequests(res.data);
  };

  const handleAction = async (id: string, policy_number: string, user_id: string, action: "approve" | "reject") => {
    try {
      await axios.post("/api/admin/insurance-requests/action", {
        requestId: id,
        policy_number,
        user_id,
        action,
      });
      fetchRequests();
    } catch (err) {
      console.error("Action failed:", err);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 text-white">
      <h2 className="text-2xl font-bold mb-4">📋 คำขอยืนยันเจ้าของประกัน</h2>
      <div className="space-y-4">
        {requests.map((req) => (
          <div key={req._id} className="bg-[#2a1b4d] p-4 rounded shadow-md">
            <p><strong>เลขประกัน:</strong> {req.policy_number}</p>
            <p><strong>User ID:</strong> {req.user_id}</p>
            <p><strong>สถานะ:</strong> {req.status}</p>
            <div className="mt-2 space-x-2">
              {req.status === "pending" && (
                <>
                  <button
                    onClick={() => handleAction(req._id, req.policy_number, req.user_id, "approve")}
                    className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded">
                    ✅ อนุมัติ
                  </button>
                  <button
                    onClick={() => handleAction(req._id, req.policy_number, req.user_id, "reject")}
                    className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded">
                    ❌ ปฏิเสธ
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
