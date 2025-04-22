"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Navbar from '../../../components/Navbar';
import NotificationBar from '../../../components/NotificationBar';
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";

const minioBaseUrl = "http://127.0.0.1:9000/my-app-images";

interface DamageDetail {
    damage_part: string;
    detected_type: string;
    damage_area: number;
    confidence: number;
    action_required: string;
    cost: number;
}

interface ReportProcess {
    report_id: string;
    car_info: { brand: string; model: string; year: string };
    damages: DamageDetail[];
    total_cost: number;
    status: "pending" | "approved" | "completed";
    createdAt: string;
    updatedAt: string;
    completedAt?: string;
    images: string[];
    processedImages: string[];
}

const StatusIndicator = ({
    status,
    currentStatus,
    icon,
    label
}: {
    status: string;
    currentStatus: string;
    icon: string;
    label: string;
}) => {
    const isActive = status === currentStatus;
    const isPending = status === "pending";
    const isApproved = status === "approved";
    const isCompleted = status === "completed";

    const isPast = (
        (currentStatus === "approved" && ["completed", "pending"].includes(status)) ||
        (currentStatus === "pending" && status === "completed")
    );

    let bgColor = "bg-gray-700";
    let borderColor = "border-gray-700";
    let textColor = "text-gray-500";

    if (isPast) {
        bgColor = "bg-gray-500";
        borderColor = "border-gray-500";
        textColor = "text-gray-400";
    } else if (isActive) {
        if (isPending) {
            bgColor = "bg-yellow-500";
            borderColor = "border-yellow-500";
            textColor = "text-yellow-400";
        } else if (isApproved) {
            bgColor = "bg-green-500";
            borderColor = "border-green-500";
            textColor = "text-green-400";
        } else {
            bgColor = "bg-blue-500";
            borderColor = "border-blue-400";
            textColor = "text-blue-400";
        }
    } else if (isPending && currentStatus === "pending") {
        bgColor = "bg-yellow-500";
        borderColor = "border-yellow-500";
        textColor = "text-yellow-400";
    } else if (isApproved && currentStatus === "approved") {
        bgColor = "bg-green-500";
        borderColor = "border-green-500";
        textColor = "text-green-400";
    }

    return (
        <div className="flex flex-col items-center">
            <div className={`w-20 h-20 flex justify-center items-center rounded-full border-2 ${borderColor} ${bgColor}`}>
                <Image
                    src={icon}
                    alt={label}
                    width={50}
                    height={80}
                    className={`rounded-lg ${textColor.includes('gray') ? "opacity-70" : ""}`}
                />
            </div>
            <span className={`mt-2 font-medium ${textColor}`}>
                {label}
            </span>
        </div>
    );
};

const ProcessConnector = ({ active }: { active: boolean }) => (
    <div className="flex-1 h-1 mx-2 mt-10">
        <div className={`h-full rounded-full ${active ? "bg-white" : "bg-gray-500"
            }`}></div>
    </div>
);

export default function ReportProcessPage() {
    const { id } = useParams();
    const [report, setReport] = useState<ReportProcess | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [customerInsurances, setCustomerInsurances] = useState<any>(null);
    const [users, setUsers] = useState<any>(null);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (!id) return;

        const fetchReport = async () => {
            try {
                const res = await fetch(`/api/user/getReportById?id=${id}`);
                if (!res.ok) throw new Error(await res.text());
                const data = await res.json();
                setReport(data.data);

                const userId = data.data.user_id?._id;
                if (!userId) throw new Error("Invalid user_id format!");

                const customerRes = await fetch(`/api/user/getCustomerInsurance?id=${userId}`);
                if (!customerRes.ok) throw new Error(await customerRes.text());
                const customerData = await customerRes.json();
                setCustomerInsurances(customerData.data);

                const userRes = await fetch(`/api/user/getUser?id=${userId}`);
                if (!userRes.ok) throw new Error(await userRes.text());
                const userData = await userRes.json();
                setUsers(userData.data);
            } catch (err) {
                console.error("Fetch Error:", err);
                setError("Error fetching details: " + (err instanceof Error ? err.message : "Unknown error"));
            } finally {
                setLoading(false);
            }
        };

        fetchReport();
    }, [id]);

    const generatePDF = async () => {
        if (!report || !customerInsurances || !users) return;
    
        const fontUrl = "/fonts/THSarabunNew.ttf";
        let fontData;
    
        try {
            const response = await fetch(fontUrl);
            if (!response.ok) throw new Error("Failed to fetch font");
            fontData = await response.arrayBuffer();
        } catch (error) {
            console.error("Error fetching font:", error);
            return;
        }
    
        const doc = new jsPDF();
        doc.addFileToVFS("THSarabunNew.ttf", btoa(
            new Uint8Array(fontData).reduce((data, byte) => data + String.fromCharCode(byte), "")
        ));
        doc.addFont("THSarabunNew.ttf", "THSarabunNew", "normal");
        doc.setFont("THSarabunNew");
    
        doc.setFontSize(18);
        doc.text("Insurance Company", 105, 20, { align: "center" });
    
        doc.setFontSize(14);
        doc.text("Car Detail", 105, 30, { align: "center" });
    
        doc.text(`Car Brand: ${report.car_info.brand}`, 14, 40);
        doc.text(`Model: ${report.car_info.model}`, 14, 48);
        doc.text(`Year: ${report.car_info.year}`, 150, 40);
        doc.text(`License Plate: ${customerInsurances.license_plate}`, 150, 48);
    
        // 🟣 เปลี่ยนเส้นเป็น #bfc3c8 และบางลง
        doc.setDrawColor(191, 195, 200);
        doc.setLineWidth(0.2);
        doc.line(14, 55, 195, 55);
    
        doc.text(`Claim ID: ${report.report_id}`, 14, 65);
        doc.text(`Policy Number: ${customerInsurances.policy_number}`, 14, 73);
        doc.text(`Policy Holder: ${users.firstName} ${users.lastName}`, 150, 73);
        doc.text(`Claim Date: ${new Date(report.createdAt).toLocaleDateString()}`, 14, 81);
        doc.text(`Incident Date: ${new Date(report.updatedAt).toLocaleDateString()}`, 14, 89);
    
        doc.line(14, 95, 195, 95); // บางเช่นกัน
    
        // ✅ จัดการข้อมูล Damage และลบ type ซ้ำ
        const groupedData = report.damages.reduce((acc, cur) => {
            const part = cur.damage_part.trim();
            if (!acc[part]) {
                acc[part] = {
                    damageTypes: new Set<string>(),
                    totalArea: 0,
                    totalConfidence: 0,
                    totalCost: 0,
                    actions: new Set<string>(),
                    count: 0
                };
            }
    
            // 🧠 แยก string ที่มี comma ออกเป็นหลาย type และ trim
            cur.detected_type.split(',').map(s => s.trim().toUpperCase()).forEach(type => {
                acc[part].damageTypes.add(type);
            });
    
            acc[part].actions.add(cur.action_required.trim().toUpperCase());
            acc[part].totalArea += cur.damage_area;
            acc[part].totalConfidence += cur.confidence;
            acc[part].totalCost += cur.cost;
            acc[part].count += 1;
    
            return acc;
        }, {} as Record<string, {
            damageTypes: Set<string>,
            totalArea: number,
            totalConfidence: number,
            totalCost: number,
            actions: Set<string>,
            count: number
        }>);
    
        autoTable(doc, {
            startY: 100,
            head: [["Part", "Damage Type", "Area (%)", "Confidence (%)", "Action", "Cost (THB)"]],
            body: Object.entries(groupedData).map(([part, values]) => [
                part,
                Array.from(values.damageTypes).join(", "),
                values.totalArea.toFixed(2),
                (values.totalConfidence / values.count).toFixed(2),
                Array.from(values.actions).join(", "),
                `$${values.totalCost.toFixed(2)}`
            ]),
            styles: { font: "THSarabunNew", fontSize: 12 },
            headStyles: { fillColor: [115, 82, 199], textColor: [255, 255, 255] },
            columnStyles: { 5: { halign: 'right' } }
        });
    
        const finalY = (doc as any).lastAutoTable.finalY + 10;
        doc.setFontSize(14);
        doc.text(`Total Damage Cost: ${report.total_cost.toFixed(2)} THB`, 14, finalY);
    
        // 🖋️ เส้นเซ็นชื่อบางลง และจัดตำแหน่ง
        doc.text("Approver Signature", 30, finalY + 15);
        doc.text("Customer Signature", 140, finalY + 15);


        
        doc.setDrawColor(0); // black
        doc.setLineWidth(0.3); // thin
        doc.line(20, finalY + 25, 80, finalY + 25);
        doc.line(130, finalY + 25, 190, finalY + 25);
    
        // ✅ หน้าใหม่ใส่รูป
        const allImages = [...(report.images || []), ...(report.processedImages || [])].slice(0, 8);
        if (allImages.length > 0) {
            doc.addPage();
            doc.setFontSize(16);
            doc.text("Damage Images", 105, 20, { align: "center" });
    
            let yOffset = 30;
            const imageWidth = 90;
            const imageHeight = 60;
            let col = 0;
    
            for (let i = 0; i < allImages.length; i++) {
                const imageUrl = allImages[i]?.startsWith("http") ? allImages[i] : `${minioBaseUrl}/${allImages[i]}`;
                const xPos = col === 0 ? 14 : 110;
    
                try {
                    // 📸 โหลดและแสดงภาพ
                    const img = await fetch(imageUrl).then(r => r.blob());
                    const base64 = await new Promise<string>((resolve) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result as string);
                        reader.readAsDataURL(img);
                    });
    
                    doc.addImage(base64, "JPEG", xPos, yOffset, imageWidth, imageHeight);
    
                    col = (col + 1) % 2;
                    if (col === 0) yOffset += imageHeight + 10;
                } catch (err) {
                    console.error("Error loading image:", imageUrl, err);
                }
            }
        }
    
        doc.save(`Insurance_Claim_${report.report_id}.pdf`);
    };
    
    
    

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div>
            <Navbar />

            <div className="container mx-auto p-6">
                <h1 className="text-3xl font-bold mb-6 text-white">Claim Status Report</h1>

                {loading && (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                    </div>
                )}

                {error && (
                    <div className="bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {report && (
                    <>
                        
                        <div className="bg-[#2e264c] p-6 rounded-2xl shadow-xl text-white">

                            {/* Process Status Indicator */}
                            <div className="flex items-center justify-between mb-8 px-4">
                                <StatusIndicator
                                    status="completed"
                                    currentStatus={report.status}
                                    icon="/img/insurance-documentation.png"
                                    label="Report Created"
                                />
                                <ProcessConnector active={["pending", "approved"].includes(report.status)} />

                                <StatusIndicator
                                    status="pending"
                                    currentStatus={report.status}
                                    icon="/img/pending.png"
                                    label="Pending Approval"
                                />
                                <ProcessConnector active={report.status === "approved"} />

                                <StatusIndicator
                                    status="approved"
                                    currentStatus={report.status}
                                    icon="/img/succ.png"
                                    label="Approved"
                                />
                            </div>

                            {/* Timeline Details */}
                            <div className="relative">
                                {/* Purple timeline line */}
                                <div className="absolute left-5 top-0 bottom-0 w-2 bg-purple-500 "></div>

                                {/* Report Created Step */}
                                <div className="relative pl-12 pb-8">
                                    <div className={`absolute left-6 top-0 w-6 h-6 rounded-full -translate-x-1/2 ${report.status === "completed" ? "bg-orange-500" : "bg-gray-500"
                                        }`}></div>

                                    <div
                                        className="flex items-center justify-between cursor-pointer bg-gray-800 p-4 rounded-lg hover:bg-gray-700 transition"
                                        onClick={toggleDropdown}
                                    >
                                        <div>
                                            <p className="text-sm text-gray-300">
                                                {new Date(report.createdAt).toLocaleString("en-US", {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                            <p className="text-white font-bold text-lg">Report Created</p>
                                        </div>
                                        <FontAwesomeIcon
                                            icon={isOpen ? faChevronUp : faChevronDown}
                                            className="text-white text-lg"
                                        />
                                    </div>

                                    {isOpen && (
                                        <div className="mt-3 bg-[#3a2e6d] text-white p-5 rounded-lg shadow-lg">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                <div>
                                                    <h3 className="text-lg font-semibold mb-2 text-purple-300">Vehicle Information</h3>
                                                    <p><span className="font-medium">Brand:</span> {report.car_info.brand}</p>
                                                    <p><span className="font-medium">Model:</span> {report.car_info.model}</p>
                                                    <p><span className="font-medium">Year:</span> {report.car_info.year}</p>
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-semibold mb-2 text-purple-300">Claim Information</h3>
                                                    <p><span className="font-medium">Report ID:</span> {report.report_id}</p>
                                                    <p><span className="font-medium">Created At:</span> {new Date(report.createdAt).toLocaleString()}</p>
                                                </div>
                                            </div>

                                            <h3 className="text-lg font-semibold mt-4 mb-3 text-purple-300">Damage Images</h3>
                                            {report.images?.length > 0 || report.processedImages?.length > 0 ? (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    {report.images.map((image, index) => {
                                                        const imageUrl = image.startsWith("http") ? image : `${minioBaseUrl}/${image}`;
                                                        const processedImage = report.processedImages?.[index];
                                                        const processedImageUrl = processedImage
                                                            ? (processedImage.startsWith("http")
                                                                ? processedImage
                                                                : `${minioBaseUrl}/${processedImage}`)
                                                            : null;

                                                        return (
                                                            <div key={index} className="space-y-2">
                                                                <div className="bg-gray-900 p-3 rounded-lg">
                                                                    <Image
                                                                        src={imageUrl}
                                                                        alt={`Original ${index + 1}`}
                                                                        width={400}
                                                                        height={250}
                                                                        className="rounded-lg w-full h-auto"
                                                                    />
                                                                </div>
                                                                {processedImageUrl && (
                                                                    <div className="bg-gray-900 p-3 rounded-lg">
                                                                        <p className="text-sm text-green-400 mb-2">Damage Assessment {index + 1}</p>
                                                                        <Image
                                                                            src={processedImageUrl}
                                                                            alt={`Processed ${index + 1}`}
                                                                            width={400}
                                                                            height={250}
                                                                            className="rounded-lg w-full h-auto"
                                                                        />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <p className="text-gray-400 italic">No images uploaded</p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Pending Approval Step */}
                                <div className="relative pl-12 pb-8">
                                    <div className={`absolute left-6 top-0 w-6 h-6 rounded-full -translate-x-1/2 ${["pending", "approved"].includes(report.status) ? "bg-yellow-500" : "bg-gray-500"
                                        }`}></div>
                                    <div className="bg-gray-800 p-4 rounded-lg">
                                        <p className="text-sm text-gray-300">
                                            {new Date(report.updatedAt).toLocaleString("en-US", {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                        <p className={`text-lg font-bold ${report.status === "pending" ? "text-yellow-400" : "text-gray-400"
                                            }`}>
                                            {report.status === "pending" ? "Waiting for Approval" : "Approval Request Sent"}
                                        </p>
                                        {report.status === "pending" && (
                                            <p className="text-gray-400 mt-1">The system is processing and verifying the damage</p>
                                        )}
                                    </div>
                                </div>

                                {/* Approved Step */}
                                {report.status === "approved" && (
                                    <div className="relative pl-12">
                                        <div className="absolute left-6 top-0 w-6 h-6 rounded-full -translate-x-1/2 bg-green-500"></div>
                                        <div className="bg-gray-800 p-4 rounded-lg">
                                            <p className="text-sm text-gray-300">
                                                {report.completedAt ? new Date(report.completedAt).toLocaleString("en-US", {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                }) : "In Progress"}
                                            </p>
                                            <p className="text-green-400 text-lg font-bold">Approved</p>
                                            <p className="text-gray-400 mt-1">This report has been approved</p>

                                            <div className="mt-4">
                                                <button
                                                    onClick={generatePDF}
                                                    className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-full transition"
                                                >
                                                    <FontAwesomeIcon icon={faDownload} />
                                                    Download PDF Document
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}