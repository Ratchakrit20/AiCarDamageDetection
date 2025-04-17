"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  insurance?: Insurance[];
}

interface Insurance {
  _id?: string;
  policy_number: string;
  insurance_type: string;
  policy_start_date: string;
  policy_end_date: string;
  car_brand: string;
  car_model: string;
  car_year: number;
  license_plate: string;
  claim_limit: number;
  coverage_details?: string;
}

export default function ManageUsers() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState<{ [key: string]: boolean }>({});
  const [newInsurance, setNewInsurance] = useState<{ [key: string]: Partial<Insurance> }>({});

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user || session.user.role !== "admin") {
      router.push("/");
    }
  }, [session, status, router]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/getUsers`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch users");
      setUsers(data.data);
    } catch (err) {
      console.error("❌ Fetch Error:", err);
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveInsurance = async (userId: string, insuranceId?: string) => {
    try {
      const insuranceData = newInsurance[userId];
      if (!insuranceData) return;

      const res = await fetch(insuranceId ? `/api/admin/updateInsurance` : `/api/admin/addInsurance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, insuranceId, insurance: insuranceData }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(`❌ Error: ${data.message}`);
        throw new Error(data.message);
      }

      alert(`✅ Insurance ${insuranceId ? "Updated" : "Added"} Successfully`);
      setNewInsurance((prev) => ({ ...prev, [userId]: {} }));
      setEditMode((prev) => ({ ...prev, [userId]: false }));
      fetchUsers();
    } catch (error) {
      console.error("❌ Save Insurance Error:", error);
    }
  };

  const filteredUsers = users.filter(user => {
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-[#1a103d] text-white px-6 py-10">
      <h1 className="text-4xl font-bold text-center mb-6"> Manage User Insurances</h1>

      <div className="max-w-md mx-auto mb-8">
        <input
          type="text"
          placeholder="Search by name..."
          className="w-full px-4 py-2 rounded-md text-black"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading && <p className="text-center">Loading...</p>}
      {error && <p className="text-center text-red-400">{error}</p>}

      <div className="space-y-6">
        {filteredUsers.map((user) => (
          <div key={user._id} className="bg-white/10 backdrop-blur rounded-xl p-6 shadow-lg">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <p className="text-xl font-bold">{user.firstName} {user.lastName}</p>
                <p className="text-sm text-gray-300">{user.email}</p>
              </div>
              <button
                className={`mt-4 md:mt-0 px-4 py-2 rounded text-white font-semibold ${editMode[user._id] ? "bg-green-600 hover:bg-green-700" : "bg-purple-600 hover:bg-purple-700"}`}
                onClick={() =>
                  editMode[user._id]
                    ? handleSaveInsurance(user._id, user.insurance?.[0]?._id)
                    : setEditMode({ ...editMode, [user._id]: true })
                }
              >
                {editMode[user._id] ? "Save" : user.insurance?.length ? "✏️ Edit Insurance" : " Add Insurance"}
              </button>
            </div>

            <div className="mt-4">
              {user.insurance?.length ? (
                user.insurance.map((policy) => (
                  <div key={policy._id} className="bg-white/5 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                      {Object.entries(policy).map(([key, value]) => (
                        key !== "_id" && (
                          <div key={key}>
                            <p className="text-sm text-gray-400 font-semibold capitalize">{key.replace(/_/g, " ")}:</p>
                            {editMode[user._id] ? (
                              <input
                                type={typeof value === "number" ? "number" : "text"}
                                defaultValue={value?.toString()}
                                onChange={(e) =>
                                  setNewInsurance((prev) => ({
                                    ...prev,
                                    [user._id]: {
                                      ...prev[user._id],
                                      [key]: e.target.value,
                                    },
                                  }))
                                }
                                className="w-full px-3 py-1 rounded bg-white text-black mt-1"
                              />
                            ) : (
                              <p className="text-sm text-white mt-1">{value?.toString()}</p>
                            )}
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400">No Insurance Found</p>
              )}
            </div>

            {editMode[user._id] && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {["policy_number", "insurance_type", "policy_start_date", "policy_end_date", "car_brand",
                 "car_model", "car_year", "license_plate", "claim_limit", "coverage_details"]
                .map((field) => (
                  <input
                    key={field}
                    type={["car_year", "claim_limit"].includes(field) ? "number" : "text"}
                    placeholder={field.replace(/_/g, " ")}
                    className="px-3 py-2 rounded bg-white text-black"
                    onChange={(e) =>
                      setNewInsurance((prev) => ({
                        ...prev,
                        [user._id]: {
                          ...prev[user._id],
                          [field]: e.target.value,
                        },
                      }))
                    }
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
