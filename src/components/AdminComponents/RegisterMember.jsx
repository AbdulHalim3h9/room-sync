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
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import ActiveMemberMonthYearPicker from "@/components/ActiveMemberMonthYearPicker";

const RegisterMember = () => {
  const [formData, setFormData] = useState({
    fullname: "",
    shortname: "",
    resident: "",
    phone: "",
    imageUrl: "",
    activeFrom: "",
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
    if (!formData.fullname || !formData.shortname || !formData.resident || !formData.activeFrom) {
      setError("Full Name, Short Name, Resident Type, and Active From are required.");
      toast({
        title: "Validation Error",
        description: "Full Name, Short Name, Resident Type, and Active From are required.",
        variant: "destructive",
      });
      return;
    }

    // Check if shortname is already taken
    try {
      const memberDocRef = doc(db, "members", formData.shortname);
      const memberDoc = await getDoc(memberDocRef);

      if (memberDoc.exists()) {
        setError("Short Name is already taken. Please choose a different one.");
        toast({
          title: "Error",
          description: "Short Name is already taken. Please choose a different one.",
          variant: "destructive",
        });
        return;
      }

      const newMember = {
        id: formData.shortname,
        fullname: formData.fullname,
        shortname: formData.shortname,
        resident: formData.resident,
        phone: formData.phone,
        imageUrl: formData.imageUrl || "",
        activeFrom: formData.activeFrom,
        archiveFrom: null,
      };

      await setDoc(memberDocRef, newMember);
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
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-6 sm:py-8">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Register New Member</h2>
          <p className="text-purple-100 text-sm mt-1 font-medium">
            Add a new member to the system
          </p>
        </div>

        <div className="p-5 sm:p-8">
          <div className="bg-purple-50 border border-purple-100 rounded-xl p-5 mb-6">
            <h3 className="text-sm font-semibold text-purple-800 mb-2">About Member Registration</h3>
            <p className="text-xs text-purple-700">Use this form to register a new member. The short name must be unique and will be used as the member's ID in the system.</p>
          </div>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-800">Full Name</Label>
                <Input
                  name="fullname"
                  value={formData.fullname}
                  onChange={handleChange}
                  placeholder="Enter member's full name"
                  className="h-11 rounded-lg border-gray-200 focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50 text-base shadow-sm"
                />
                <p className="text-xs text-gray-500">Enter the complete name of the member</p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-800">Short Name</Label>
                <Input
                  name="shortname"
                  value={formData.shortname}
                  onChange={handleChange}
                  placeholder="Enter unique short name"
                  className="h-11 rounded-lg border-gray-200 focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50 text-base shadow-sm"
                />
                <p className="text-xs text-gray-500">This will be used as the member's unique ID</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-800">Resident Type</Label>
                <Select onValueChange={handleSelectChange} value={formData.resident}>
                  <SelectTrigger className="h-11 rounded-lg border-gray-200 focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50 text-base shadow-sm">
                    <SelectValue placeholder="Select resident type" />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg border-gray-200 shadow-lg">
                    <SelectItem value="dining" className="py-2.5 text-base font-medium">Dining</SelectItem>
                    <SelectItem value="room" className="py-2.5 text-base font-medium">Room</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">Determines the member's residence status</p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-800">Phone Number</Label>
                <Input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  type="tel"
                  className="h-11 rounded-lg border-gray-200 focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50 text-base shadow-sm"
                />
                <p className="text-xs text-gray-500">Contact number for the member</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-800">Active From</Label>
                <ActiveMemberMonthYearPicker
                  value={formData.activeFrom}
                  onChange={handleMonthChange}
                  className="h-11 rounded-lg border-gray-200 focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50 text-base shadow-sm"
                />
                <p className="text-xs text-gray-500">Month from which the member will be active</p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-800">Profile Image URL</Label>
                <Input
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                  className="h-11 rounded-lg border-gray-200 focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50 text-base shadow-sm"
                />
                <p className="text-xs text-gray-500">Optional: URL to member's profile picture</p>
              </div>
            </div>

            {formData.imageUrl && (
              <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div className="relative">
                  <img
                    src={formData.imageUrl}
                    alt="Profile Preview"
                    className="w-24 h-24 rounded-full object-cover border-2 border-purple-200"
                    onError={() => setError("Invalid image URL")}
                  />
                  <div className="absolute -bottom-1 -right-1 bg-purple-100 text-purple-700 text-xs font-medium px-2 py-1 rounded-full">
                    Preview
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-lg">
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}

            <div className="pt-4">
              <Button 
                type="submit" 
                className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white text-base font-medium rounded-lg shadow-sm transition-colors duration-200 focus:ring-4 focus:ring-purple-200 focus:ring-opacity-50"
              >
                Register New Member
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterMember;