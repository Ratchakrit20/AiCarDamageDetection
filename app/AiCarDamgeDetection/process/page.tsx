'use client';

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from '../../components/Navbar';

interface DamageReport {
    _id: string;
    report_id: string;
    createdAt: string;
    status: "pending" | "approved" | "rejected";
}

export default function ProcessPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [reports, setReports] = useState<DamageReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState<string>('all');

    const approvedCount = reports.filter(r => r.status === "approved").length;
    const pendingCount = reports.filter(r => r.status === "pending").length;
    const rejectedCount = reports.filter(r => r.status === "rejected").length;
    const allCount = reports.length;

    useEffect(() => {
        if (!session) return;

        const fetchReports = async () => {
            try {
                const res = await fetch(`/api/user/getReports?userId=${session.user.id}`);
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || "Failed to fetch reports");
                setReports(Array.isArray(data.data) ? data.data : []);
            } catch (err) {
                console.error("❌ Fetch Error:", err);
                setError("Error fetching reports");
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, [session]);

    const filteredReports = filter === 'all'
        ? reports
        : reports.filter((report) => report.status === filter);

    const getBorderColor = (status: string) => {
        switch (status) {
            case 'approved': return 'border-8 border-purple-500';
            case 'pending': return 'border-8 border-yellow-500 border-r-0';
            case 'rejected': return 'border-8 border-red-500';
            default: return 'border-2 border-gray-300';
        }
    };

    return (
        <div>
            <Navbar />
            <div className="container mx-auto px-4 py-10">
                <div className="flex justify-between items-center mb-6 gap-4 flex-wrap">
                    <h1 className="text-4xl  font-bold text-white">Claim Documents</h1>
                    <div className="flex items-center gap-4">
                       

                        <div className="flex items-center gap-2 bg-[#2e264c] p-2 px-4 rounded-xl">
                            <span className="w-6 h-6 flex items-center justify-center rounded-full bg-green-600 text-white text-sm font-bold">
                                {approvedCount}
                            </span>
                            <span className="w-6 h-6 flex items-center justify-center rounded-full bg-yellow-400 text-black text-sm font-bold">
                                {pendingCount}
                            </span>
                            <span className="w-6 h-6 flex items-center justify-center rounded-full bg-red-600 text-white text-sm font-bold">
                                {rejectedCount}
                            </span>
                            <span className="flex items-center bg-purple-500 text-white rounded-full pl-2 h-6 text-sm font-bold">
                                ALL
                                <span className="ml-2 w-6 h-6 bg-white text-black rounded-full flex items-center justify-center font-bold">
                                    {allCount}
                                </span>
                            </span>
                        </div>
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="bg-purple-500 text-white px-4 py-2 rounded-xl shadow-md focus:outline-none"
                        >
                            <option value="all">All</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                </div>

                {loading && <p className="text-gray-300 text-center">Loading...</p>}
                {error && <p className="text-red-500 text-center">{error}</p>}

                <div className="space-y-4">
                    {filteredReports.map((report) => {
                        const date = new Date(report.createdAt);
                        const month = date.toLocaleString('default', { month: 'short' });
                        const day = date.getDate();
                        const year = date.getFullYear();

                        return (
                            <Link key={report._id} href={`/AiCarDamgeDetection/process/${report._id}`}>
                                <div className="mb-4 flex items-center justify-between bg-[#2e264c] text-white p-5 rounded-2xl shadow hover:shadow-lg transition-all">
                                    <div className={`w-[80px] h-[80px] rounded-xl overflow-hidden mr-4 bg-white text-black font-bold flex flex-col items-center justify-center ${getBorderColor(report.status)}`}>
                                        <span className="text-xs uppercase">{month}</span>
                                        <span className="text-2xl">{day}</span>
                                        <span className="text-xs">{year}</span>
                                    </div>

                                    <div className="flex flex-col flex-1">
                                        <p className="text-lg font-bold">Claim Document</p>
                                        <p className="text-sm text-gray-300">[{report.report_id}]</p>
                                    </div>

                                    <div>
                                        <span
                                            className={`px-4 py-1 rounded-full text-sm font-bold ${
                                                report.status === "approved"
                                                    ? "bg-green-600"
                                                    : report.status === "rejected"
                                                        ? "bg-red-600"
                                                        : "bg-yellow-500"
                                            } text-white`}
                                        >
                                            {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
