"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { db } from "@/firebase";
import { collection, addDoc } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { useToast } from "@/hooks/use-toast";
import ActiveMemberMonthYearPicker from "@/components/ActiveMemberMonthYearPicker";

const RegisterMember = () => {
  const [formData, setFormData] = useState({
    fullname: "",
    shortname: "",
    resident: "",
    phone: "",
    imageUrl: "",
    activeFrom: "", // New field for activation month
  });
  const [error, setError] = useState("");
  const { toast } = useToast();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSelectChange = (value) => {
    setFormData({
      ...formData,
      resident: value,
    });
  };

  const handleMonthChange = (value) => {
    setFormData({
      ...formData,
      activeFrom: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate required fields
    if (!formData.fullname || !formData.resident || !formData.activeFrom) {
      setError("Full Name, Resident Type, and Active From are required.");
      return;
    }

    const memberId = uuidv4();
    const newMember = {
      id: memberId,
      fullname: formData.fullname,
      shortname: formData.shortname,
      resident: formData.resident,
      phone: formData.phone,
      imageUrl: formData.imageUrl || "",
      activeFrom: formData.activeFrom,
      archiveFrom: null, // Initialize as null
    };

    try {
      await addDoc(collection(db, "members"), newMember);
      toast({
        title: "Member Registered",
        description: `${formData.fullname} will be active from ${formData.activeFrom}.`,
      });

      // Reset form
      setFormData({
        fullname: "",
        shortname: "",
        resident: "",
        phone: "",
        imageUrl: "",
        activeFrom: "",
      });
    } catch (err) {
      console.error("Firestore Error:", err.message);
      setError("Failed to register member.");
      toast({
        title: "Error",
        description: "Failed to register member.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-6">Register New Member</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <Label>Full Name</Label>
          <Input
            name="fullname"
            value={formData.fullname}
            onChange={handleChange}
            placeholder="Enter full name"
          />
        </div>

        <div>
          <Label>Short Name</Label>
          <Input
            name="shortname"
            value={formData.shortname}
            onChange={handleChange}
            placeholder="Enter short name"
          />
        </div>

        <div>
          <Label>Resident Type</Label>
          <Select onValueChange={handleSelectChange} value={formData.resident}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dining">Dining</SelectItem>
              <SelectItem value="room">Room</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Phone Number</Label>
          <Input
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Enter phone number"
            type="tel"
          />
        </div>

        <div>
          <Label>Active From</Label>
          <ActiveMemberMonthYearPicker
            value={formData.activeFrom}
            onChange={handleMonthChange}
          />
        </div>

        <div>
          <Label>Image URL</Label>
          <Input
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleChange}
            placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
          />
          {formData.imageUrl && (
            <img
              src={formData.imageUrl}
              alt="Preview"
              className="w-20 h-20 mt-2 rounded-full"
              onError={() => setError("Invalid image URL")}
            />
          )}
        </div>

        {error && <p className="text-red-500 mt-2">{error}</p>}

        <Button type="submit" className="bg-blue-500 text-white">
          Register Member
        </Button>
      </form>
    </div>
  );
};

export default RegisterMember;