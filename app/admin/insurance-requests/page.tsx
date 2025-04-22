"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { format, isValid, parseISO } from "date-fns";

interface InsuranceRequest {
  _id: string;
  customer_ins: number;
  user_id: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  policy_number: string;
  insurance_type: string;
  policy_start_date?: string;
  policy_end_date?: string;
  car_brand: string;
  car_model: string;
  car_year: number;
  license_plate: string;
  claim_limit: number;
  coverage_details?: string;
  status: "pending" | "approved" | "rejected";
  rejection_reason?: string;
  createdAt?: string;
}

export default function AdminInsuranceRequests() {
  const { data: session } = useSession();
  const [requests, setRequests] = useState<InsuranceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectReason, setRejectReason] = useState<{ [key: string]: string }>({});

  const formatSafeDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    const parsed = parseISO(dateStr);
    return isValid(parsed) ? format(parsed, "dd/MM/yyyy") : "-";
  };

  const fetchRequests = async () => {
    const res = await fetch("/api/admin/insurance-request/list");
    const data = await res.json();
    setRequests(data.data || []);
    setLoading(false);
  };

  const handleAction = async (requestId: string, action: "approved" | "rejected") => {
    const reason = rejectReason[requestId] || "";
    const res = await fetch("/api/admin/insurance-request/approve", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId, action, reason }),
    });
    const result = await res.json();
    if (res.ok) {
      fetchRequests();
    } else {
      alert(result.message);
    }
  };

  useEffect(() => {
    if (session?.user?.role === "admin") {
      fetchRequests();
    }
  }, [session]);

  if (session?.user?.role !== "admin") return <p className="p-10">❌ Unauthorized</p>;

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6 text-white">Insurance Registration Requests</h1>
      {loading ? (
        <p className="text-white">Loading requests...</p>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {requests.map((req) => (
            <li key={req._id} className="bg-white shadow-md p-5 rounded-lg space-y-2">
              <div className="space-y-1">
                <p><strong>Requested By:</strong> {req.user_id?.firstName} {req.user_id?.lastName}</p>
                <p><strong>Policy No.:</strong> {req.policy_number || "-"}</p>
                <p><strong>Type:</strong> {req.insurance_type || "-"}</p>
                <p><strong>Start Date:</strong> {formatSafeDate(req.policy_start_date)}</p>
                <p><strong>End Date:</strong> {formatSafeDate(req.policy_end_date)}</p>
                <p><strong>Car:</strong> {req.car_brand || "-"} {req.car_model || "-"} ({req.car_year || "-"})</p>
                <p><strong>License Plate:</strong> {req.license_plate || "-"}</p>
                <p><strong>Limit:</strong> {typeof req.claim_limit === "number" ? req.claim_limit.toLocaleString() : "-"}</p>
                <p><strong>Coverage:</strong> {req.coverage_details || '-'}</p>
                <p><strong>Submitted At:</strong> {formatSafeDate(req.createdAt)}</p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span className={
                    req.status === "approved" ? "text-green-600" :
                    req.status === "rejected" ? "text-red-500" : "text-yellow-600"
                  }>
                    {req.status.toUpperCase()}
                  </span>
                </p>
              </div>

              {req.status === "pending" && (
                <div className="mt-4 space-y-2">
                  <textarea
                    placeholder="Reason for rejection (optional)"
                    className="w-full border border-gray-300 p-2 rounded"
                    value={rejectReason[req._id] || ""}
                    onChange={(e) => setRejectReason({ ...rejectReason, [req._id]: e.target.value })}
                  />
                  <div className="flex gap-3">
                    <button
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                      onClick={() => handleAction(req._id, "approved")}
                    >
                      ✅ Approve
                    </button>
                    <button
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                      onClick={() => handleAction(req._id, "rejected")}
                    >
                      ❌ Reject
                    </button>
                  </div>
                </div>
              )}

              {req.status === "rejected" && req.rejection_reason && (
                <p className="text-sm text-red-500">📌 Reason: {req.rejection_reason}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}