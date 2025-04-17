"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from '../components/Navbar';


interface DamageReport {
    _id: string;
    report_id: string;
    user_id: { firstName: string; lastName: string } | null;
    car_info: { brand: string; model: string; year: string };
    images: string[];
    damages: { damage_part: string; detected_type: string; confidence: number; action_required: string; cost: number }[];
    total_cost: number;
    status: string;
}

export default function AdminPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [damageReports, setDamageReports] = useState<DamageReport[]>([]);
    const [filter, setFilter] = useState("pending");
    const [selectedImages, setSelectedImages] = useState<string[]>([]);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);

    useEffect(() => {
        if (status !== "loading" && (!session?.user || session.user.role !== "admin")) {
            router.push("/");
        }
    }, [session, status, router]);

    const fetchReports = async () => {
        try {
            const res = await fetch(`/api/admin/getReports?status=${filter}`);
            if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

            const data = await res.json();
            if (data.data && Array.isArray(data.data)) {
                const transformedData = data.data.map((report: Record<string, any>) => ({
                    _id: report._id || "",
                    report_id: report.report_id || "",
                    user_id: report.user_id ? { firstName: report.user_id.firstName, lastName: report.user_id.lastName } : null,
                    car_info: report.car_info || { brand: "", model: "", year: "" },
                    images: report.images || [],
                    damages: report.damages || [],
                    total_cost: report.total_cost || 0,
                    status: report.status || "pending",
                }));
                setDamageReports(transformedData);
            }
        } catch (error) {
            console.error("Error fetching reports:", error);
        }
    };

    useEffect(() => {
        fetchReports();
    
    }, [filter,]);

    const updateStatus = async (id: string, status: string, reason?: string) => {
        try {
            const res = await fetch("/api/admin/updateStatus", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, status, reason }),
            });
            if (!res.ok) throw new Error("Failed to update status");
            fetchReports();
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    const handleViewImages = (images: string[]) => {
        if (images.length === 0) {
            alert("No images available");
            return;
        }
        setSelectedImages(images);
        setIsImageModalOpen(true);
    };

    const closeImageModal = () => {
        setIsImageModalOpen(false);
        setSelectedImages([]);
    };

    return (
        <div className="min-h-screen bg-[#1a103d] text-white">
            <Navbar />
            <div className="container mx-auto px-6 py-10">
                <h1 className="text-4xl font-bold text-center mb-6">Reports Management</h1>

                <div className="flex justify-end items-center mb-6 gap-4 flex-wrap">
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="bg-purple-700 text-white px-4 py-2 rounded-md shadow-md focus:outline-none"
                    >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full border border-white/10 rounded-lg overflow-hidden text-sm">
                        <thead className="bg-white/10 text-white">
                            <tr>
                                <th className="p-3 text-left">Report ID</th>
                                <th className="p-3 text-left">User</th>
                                <th className="p-3 text-left">Car</th>
                                <th className="p-3 text-left">Details</th>
                                <th className="p-3 text-left">Images</th>
                                <th className="p-3 text-left">Total (฿)</th>
                                <th className="p-3 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white/5">
                            {damageReports.map((report) => (
                                <tr key={report._id} className="hover:bg-white/10 border-b border-white/10">
                                    <td className="p-3 font-mono">{report.report_id}</td>
                                    <td className="p-3">{report.user_id ? `${report.user_id.firstName} ${report.user_id.lastName}` : "N/A"}</td>
                                    <td className="p-3">{`${report.car_info.brand} ${report.car_info.model} (${report.car_info.year})`}</td>
                                    <td className="p-3">
                                        <table className="w-full text-xs">
                                            <thead>
                                                <tr className="text-white/80">
                                                    <th className="text-left">Part</th>
                                                    <th className="text-left">Damage Type</th>
                                                    <th className="text-left">Recommend</th>
                                                    <th className="text-left">Price</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {report.damages.map((dmg, i) => (
                                                    <tr key={i}>
                                                        <td>{dmg.damage_part}</td>
                                                        <td>{dmg.detected_type}</td>
                                                        <td>{dmg.action_required.toUpperCase()}</td>
                                                        <td>฿{dmg.cost}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </td>
                                    <td className="p-3">
                                        <button onClick={() => handleViewImages(report.images)} className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-full">View</button>
                                    </td>
                                    <td className="p-3 font-semibold">฿{report.total_cost}</td>
                                    <td className="p-3 space-x-2">
                                        {filter === "pending" && (
                                            <>
                                                <button className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded-md" onClick={() => updateStatus(report._id, "approved")}>Approve</button>
                                                <button className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded-md" onClick={() => {
                                                    const reason = prompt("Reason for rejection?");
                                                    if (reason) updateStatus(report._id, "rejected", reason);
                                                }}>Reject</button>
                                          

                                            </>
                                        )}
                                        {filter !== "pending" && (
                                            <button className="bg-yellow-500 hover:bg-yellow-600 px-3 py-1 rounded-full" onClick={() => updateStatus(report._id, "pending")}>Reset</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {isImageModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
                        <div className="bg-white text-black p-6 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
                            <h2 className="text-xl font-bold mb-4">Damage Images</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {selectedImages.map((image, index) => (
                                    <div key={index} className="rounded overflow-hidden">
                                        <img src={image} alt={`Damage ${index}`} className="w-full h-48 object-cover rounded-lg" />
                                    </div>
                                ))}
                            </div>
                            <button onClick={closeImageModal} className="mt-6 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full">
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}