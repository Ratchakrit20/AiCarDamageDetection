"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../../components/Navbar";
import { useSession } from "next-auth/react";

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
  status: "pending" | "approved" | "rejected";
  registered_car_image?: string;
  firstName?: string;
  lastName?: string;
}

export default function AdminInsurancePage() {
  const { data: session } = useSession();
  const userId = session?.user?.id || "67ae32d64ab6d19082b86ddd";
  const [formData, setFormData] = useState<Insurance>({
    policy_number: "",
    insurance_type: "Full Coverage",
    policy_start_date: "",
    policy_end_date: "",
    car_brand: "",
    car_model: "",
    car_year: new Date().getFullYear(),
    license_plate: "",
    claim_limit: 0,
    coverage_details: "",
    status: "pending",
    firstName: "",
    lastName: "",
  });
  const [insuranceList, setInsuranceList] = useState<Insurance[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const res = await axios.get<Insurance[]>("/api/admin/getAllInsurance");
      setInsuranceList(res.data);
    } catch (error) {
      console.error("Error fetching insurance list:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "car_year" || name === "claim_limit" ? parseFloat(value) : value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let imageUrl = formData.registered_car_image || "";

      if (imageFile) {
        const imgForm = new FormData();
        imgForm.append("image", imageFile);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: imgForm,
        });
        const uploadData = await uploadRes.json();
        imageUrl = uploadData.url;
      }

      const genRes = await axios.get<{ customer_ins: number }>("/api/admin/generateCustomerIns");
      const generatedCustomerIns = genRes.data.customer_ins;

      const payload = {
        ...formData,
        registered_car_image: imageUrl,
        user_id: userId,
        customer_ins: generatedCustomerIns,
      };

      if (editId) {
        await axios.patch(`/api/admin/updateInsurance/${editId}`, payload);
      } else {
        await axios.post("/api/admin/createCustomerInsurance", payload);
      }

      setFormData({
        policy_number: "",
        insurance_type: "Full Coverage",
        policy_start_date: "",
        policy_end_date: "",
        car_brand: "",
        car_model: "",
        car_year: new Date().getFullYear(),
        license_plate: "",
        claim_limit: 0,
        coverage_details: "",
        status: "pending",
        firstName: "",
        lastName: "",
      });
      setImageFile(null);
      setEditId(null);
      setIsFormVisible(false);
      fetchData();
    } catch (error) {
      console.error("Error submitting insurance data:", error);
    }
  };

  const handleEdit = (insurance: Insurance) => {
    setFormData(insurance);
    setEditId(insurance._id || null);
    setIsFormVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/admin/deleteInsurance/${id}`);
      fetchData();
    } catch (error) {
      console.error("Error deleting insurance:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a103d] text-white">
      <Navbar />
      <div className="max-w-5xl mx-auto p-6 mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Insurance information list</h2>
          <button
            className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded"
            onClick={() => setIsFormVisible(!isFormVisible)}>
            {isFormVisible ? "Cancel" : "Add Insurance Data"}
          </button>
        </div>

        {isFormVisible && (
          <form onSubmit={handleSubmit} className="bg-[#26194d] p-4 rounded mb-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} className="p-2 rounded bg-gray-900" required />
              <input name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} className="p-2 rounded bg-gray-900" required />
              <input name="policy_number" placeholder="Policy Number" value={formData.policy_number} onChange={handleChange} className="p-2 rounded bg-gray-900" required />
              <select name="insurance_type" value={formData.insurance_type} onChange={handleChange} className="p-2 rounded bg-gray-900">
                <option value="Full Coverage">Full Coverage</option>
                <option value="Third Party">Third Party</option>
                <option value="Other">Other</option>
              </select>
              <input type="date" name="policy_start_date" value={formData.policy_start_date} onChange={handleChange} className="p-2 rounded bg-gray-900" required />
              <input type="date" name="policy_end_date" value={formData.policy_end_date} onChange={handleChange} className="p-2 rounded bg-gray-900" required />
              <input name="car_brand" placeholder="Car Brand" value={formData.car_brand} onChange={handleChange} className="p-2 rounded bg-gray-900" required />
              <input name="car_model" placeholder="Car Model" value={formData.car_model} onChange={handleChange} className="p-2 rounded bg-gray-900" required />
              <input type="number" name="car_year" placeholder="Car Year" value={formData.car_year} onChange={handleChange} className="p-2 rounded bg-gray-900" required />
              <input name="license_plate" placeholder="License Plate" value={formData.license_plate} onChange={handleChange} className="p-2 rounded bg-gray-900" required />
              <input type="number" name="claim_limit" placeholder="Claim Limit" value={formData.claim_limit} onChange={handleChange} className="p-2 rounded bg-gray-900" required />
              <input type="file" accept="image/*" onChange={handleImageChange} className="text-white" />
            </div>
           
            <button type="submit" className="bg-green-600 px-4 py-2 rounded">💾 บันทึก</button>
          </form>
        )}

        <div className="space-y-4">
          {insuranceList.map((insurance) => (
            <div key={insurance._id} className="bg-[#2a1b4d] p-4 rounded shadow-md">
              <div className="flex justify-between">
                <div>
                  <p><strong>ชื่อ:</strong> {insurance.firstName} {insurance.lastName}</p>
                  <p><strong>Policy:</strong> {insurance.policy_number}</p>
                  <p><strong>Car:</strong> {insurance.car_brand} {insurance.car_model} ({insurance.car_year})</p>
                  <p><strong>License Plate:</strong> {insurance.license_plate}</p>
                  <p><strong>Status:</strong> {insurance.status}</p>
                </div>
                <div className="flex flex-col items-end">
                  {insurance.registered_car_image && <img src={insurance.registered_car_image} alt="Car" className="h-20 rounded mb-2" />}
                  <button onClick={() => handleEdit(insurance)} className="bg-yellow-500 hover:bg-yellow-600 px-3 py-1 rounded mb-1">Edit</button>
                  <button onClick={() => handleDelete(insurance._id!)} className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
