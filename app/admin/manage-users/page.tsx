"use client";

import React, { useState } from "react";
import axios from "axios";
import Navbar from "../../components/Navbar";

export default function AdminInsuranceUpload() {
  const [formData, setFormData] = useState({
    customer_ins: "",
    policy_number: "",
    insurance_type: "",
    policy_start_date: "",
    policy_end_date: "",
    car_brand: "",
    car_model: "",
    car_year: "",
    license_plate: "",
    claim_limit: "",
    coverage_details: "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let imageUrl = "";
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

      const finalData = {
        ...formData,
        customer_ins: parseInt(formData.customer_ins),
        car_year: parseInt(formData.car_year),
        claim_limit: parseFloat(formData.claim_limit),
        registered_car_image: imageUrl,
      };

      await fetch("/api/admin/createCustomerInsurance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: "6615df0ec1d6f3f2957e2d8a",  // ต้องเป็น ObjectId string
          car_brand: "Toyota",
          car_model: "Camry",
          car_year: 2020,
          policy_number: "ABC1234567",
          insurance_type: "Full Coverage",
          policy_start_date: "2024-01-01",
          policy_end_date: "2024-12-31",
          license_plate: "กข 1234",
          claim_limit: "500000",
          status: "approved",
          registered_car_image: "https://your-image-url",
          customer_ins: 1234567890
        })
      });
      
      setImageFile(null);
    } catch (error) {
      console.error("Error saving insurance info:", error);
      alert("Failed to save insurance info");
    }
  };

  return (
    <div className="min-h-screen bg-[#1a103d] text-white">
      <Navbar />
      <div className="max-w-2xl mx-auto p-6 mt-8 bg-[#26194d] rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Add Insurance Info</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {Object.entries(formData).map(([key, value]) => (
            <div key={key}>
              <label className="block text-sm mb-1 capitalize">{key.replace(/_/g, ' ')}</label>
              {key === "coverage_details" ? (
                <textarea
                  name={key}
                  value={value}
                  onChange={handleChange}
                  className="w-full p-2 rounded bg-gray-900 text-white"
                />
              ) : (
                <input
                  type={key.includes("date") ? "date" : "text"}
                  name={key}
                  value={value}
                  onChange={handleChange}
                  className="w-full p-2 rounded bg-gray-900 text-white"
                />
              )}
            </div>
          ))}
          <div>
            <label className="block text-sm mb-1">Registered Car Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="text-white"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 p-2 rounded font-bold"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}