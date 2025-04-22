"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";

interface InsuranceData {
    _id: string;
    policy_number: string;
    insurance_type: string;
    car_brand: string;
    car_model: string;
    car_year: number;
    license_plate: string;
    claim_limit: number;
    coverage_details: string;
    status: "pending" | "approved" | "rejected";
    rejection_reason?: string;
}

export default function AccountPage() {
    const { data: session } = useSession();
    const [insuranceData, setInsuranceData] = useState<InsuranceData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInsurance = async () => {
            if (!session?.user?._id) return;

            try {
                const res = await fetch(`/api/user/getCustomerInsurance?id=${session.user._id}`);
                const result = await res.json();
                if (res.ok) {
                    setInsuranceData(result.data);
                } else {
                    setInsuranceData(null);
                }
            } catch (error) {
                console.error("❌ Error fetching insurance data:", error);
                setInsuranceData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchInsurance();
    }, [session]);

    return (
        <div>
            <Navbar />
            <div className="max-w-3xl mx-auto py-10 px-4">
                <h1 className="text-3xl font-bold text-white mb-6">Account Settings</h1>

                <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
                    <p><strong>Username:</strong> {session?.user.username}</p>
                    <p><strong>Name:</strong> {session?.user.firstName}</p>
                    <p><strong>Role:</strong> {session?.user.role}</p>
                </div>

                {loading ? (
                    <p className="mt-6 text-gray-500">กำลังโหลดข้อมูลประกัน...</p>
                ) : insuranceData ? (
                    <div className="mt-6 p-6 bg-purple-100 rounded shadow-md space-y-2">
                        <h2 className="text-xl font-semibold mb-3">Insurance Information</h2>
                        <p><strong>Policy No.:</strong> {insuranceData.policy_number}</p>
                        <p><strong>Vehicle:</strong> {insuranceData.car_brand} {insuranceData.car_model} ({insuranceData.car_year})</p>
                        <p><strong>License Plate:</strong> {insuranceData.license_plate}</p>
                       
                        <p><strong>Coverage:</strong> {insuranceData.coverage_details || "ไม่มีรายละเอียด"}</p>

                        

                        {insuranceData.status === "approved" && (
                            <p className="text-green-700 mt-2">ข้อมูลประกันของคุณได้รับการอนุมัติแล้ว</p>
                        )}

                        {insuranceData.status === "pending" && (
                            <>
                                {/* <p className="text-yellow-700 mt-2">ระบบกำลังตรวจสอบข้อมูลของคุณ</p> */}
                                <Link href="/account/insuranceRegisterForm">
                                    <button className="mt-3 bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">
                                        แก้ไขข้อมูล
                                    </button>
                                </Link>
                            </>
                        )}

                        {insuranceData.status === "rejected" && (
                            <>
                                <p className="text-red-600 mt-2">ข้อมูลของคุณไม่ผ่านการตรวจสอบ</p>
                                {insuranceData.rejection_reason && (
                                    <p className="text-sm text-red-400">เหตุผล: {insuranceData.rejection_reason}</p>
                                )}
                                <Link href="/account/insuranceRegisterForm">
                                    <button className="mt-3 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                                        ลงทะเบียนใหม่
                                    </button>
                                </Link>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="mt-6 bg-white p-6 rounded shadow-md text-center">
                        <p className="text-gray-600">คุณยังไม่มีข้อมูลประกันในระบบ</p>
                        <Link href="/account/insuranceRegisterForm">
                            <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                                ลงทะเบียนประกัน
                            </button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
