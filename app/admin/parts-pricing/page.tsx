"use client";

import { useState, useEffect } from "react";
import axios from "axios";

interface Part {
  part_id: number;
  name: string;
  price: { $numberDecimal: string };
  repair: { $numberDecimal: string };
  last_updated?: string;
}

export default function PartsPricingAdmin() {
  const [parts, setParts] = useState<Part[]>([]);
  const [newPart, setNewPart] = useState({ name: "", price: 0, repair: 0 });
  const [editingPart, setEditingPart] = useState<Part | null>(null);
  const [editingPartId, setEditingPartId] = useState<number | null>(null);

  useEffect(() => {
    fetchParts();
  }, []);

  const fetchParts = async () => {
    try {
      const res = await axios.get<{ success: boolean; parts: Part[] }>("/api/admin/parts-pricing");
      if (res.data.success) setParts(res.data.parts);
    } catch (error) {
      console.error("❌ Failed to fetch parts:", error);
    }
  };

  const handleAddPart = async () => {
    if (!newPart.name) {
      alert("⚠️ Please enter part name!");
      return;
    }

    try {
      const res = await axios.post<{ success: boolean; part: Part }>("/api/admin/parts-pricing", {
        ...newPart,
        price: { $numberDecimal: newPart.price.toString() },
        repair: { $numberDecimal: newPart.repair.toString() },
      });
      if (res.data.success) {
        setParts([...parts, res.data.part]);
        setNewPart({ name: "", price: 0, repair: 0 });
      }
    } catch (error) {
      console.error("❌ Failed to add part:", error);
    }
  };

  const handleEditPart = (part_id: number) => {
    setEditingPartId(part_id);
    setEditingPart(parts.find((part) => part.part_id === part_id) || null);
  };

  const handleSavePart = async (part_id: number) => {
    if (!editingPart) return;

    try {
      const res = await axios.put<{ success: boolean }>("/api/admin/parts-pricing", {
        part_id,
        price: { $numberDecimal: editingPart.price.$numberDecimal },
        repair: { $numberDecimal: editingPart.repair.$numberDecimal },
      });

      if (res.data.success) {
        setParts(parts.map((part) => (part.part_id === part_id ? editingPart : part)));
        setEditingPartId(null);
        setEditingPart(null);
      }
    } catch (error) {
      console.error("❌ Failed to save part:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a103d] text-white p-6">
      <h1 className="text-4xl font-bold text-center mb-10">Car Parts Pricing Management</h1>

      {/* Add New Part */}
      <div className="bg-white/10 p-6 rounded-xl shadow-xl mb-8">
        <h2 className="text-xl font-semibold mb-4"> Add New Part</h2>
        <div className="flex flex-wrap gap-4 items-center">
          <input
            type="text"
            placeholder="Part Name"
            value={newPart.name}
            onChange={(e) => setNewPart({ ...newPart, name: e.target.value })}
            className="border p-2 rounded w-full sm:w-1/3 text-black"
          />
          <input
            type="number"
            placeholder="Replace Cost"
            value={newPart.price}
            onChange={(e) => setNewPart({ ...newPart, price: parseFloat(e.target.value) || 0 })}
            className="border p-2 rounded w-full sm:w-1/4 text-black"
          />
          <input
            type="number"
            placeholder="Repair Cost"
            value={newPart.repair}
            onChange={(e) => setNewPart({ ...newPart, repair: parseFloat(e.target.value) || 0 })}
            className="border p-2 rounded w-full sm:w-1/4 text-black"
          />
          <button
            onClick={handleAddPart}
            className="bg-green-600 hover:bg-green-700 px-5 py-2 rounded text-white"
          >
            Add
          </button>
        </div>
      </div>

      {/* Parts List */}
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border border-white/10 bg-white/5 text-sm rounded-xl overflow-hidden">
          <thead className="bg-purple-800 text-white">
            <tr>
              <th className="p-3 text-left">Part Name</th>
              <th className="p-3 text-left">Repair Cost (฿)</th>
              <th className="p-3 text-left">Replace Cost (฿)</th>
              <th className="p-3 text-left">Last Updated</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {parts.map((part) => (
              <tr key={part.part_id} className="border-b border-white/10 hover:bg-white/10">
                <td className="p-3">{part.name}</td>
                <td className="p-3">
                  {editingPartId === part.part_id ? (
                    <input
                      type="number"
                      value={editingPart?.repair ? parseFloat(editingPart.repair.$numberDecimal) : parseFloat(part.repair.$numberDecimal)}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0;
                        setEditingPart((prev) => ({
                          ...(prev || part),
                          part_id: part.part_id,
                          repair: { $numberDecimal: value.toString() },
                        }));
                      }}
                      className="text-black border rounded p-1 w-24"
                    />
                  ) : (
                    parseFloat(part.repair.$numberDecimal)
                  )}
                </td>
                <td className="p-3">
                  {editingPartId === part.part_id ? (
                    <input
                      type="number"
                      value={editingPart?.price ? parseFloat(editingPart.price.$numberDecimal) : parseFloat(part.price.$numberDecimal)}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0;
                        setEditingPart((prev) => ({
                          ...(prev || part),
                          part_id: part.part_id,
                          price: { $numberDecimal: value.toString() },
                        }));
                      }}
                      className="text-black border rounded p-1 w-24"
                    />
                  ) : (
                    parseFloat(part.price.$numberDecimal)
                  )}
                </td>
                <td className="p-3">{part.last_updated ? new Date(part.last_updated).toLocaleDateString() : "-"}</td>
                <td className="p-3">
                  {editingPartId === part.part_id ? (
                    <button
                      onClick={() => handleSavePart(part.part_id)}
                      className="bg-green-600 px-4 py-1 text-white rounded hover:bg-green-700"
                    >
                      Save
                    </button>
                  ) : (
                    <button
                      onClick={() => handleEditPart(part.part_id)}
                      className="bg-blue-600 px-4 py-1 text-white rounded hover:bg-blue-700"
                    >
                      Edit
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
