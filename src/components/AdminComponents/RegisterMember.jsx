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
import { db } from "@/firebase"; // Adjust the path to your Firebase config
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";

const RegisterMember = () => {
  const [formData, setFormData] = useState({
    fullname: "",
    shortname: "",
    resident: "",
    phone: "",
    imageUrl: "", // Changed from 'image' to 'imageUrl' for storing a link
    status: "active", // Added status field as in previous versions
  });
  const [error, setError] = useState(""); // Added for error handling

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const memberId = uuidv4();

    // Prepare member data for Firestore
    const newMember = {
      id: memberId,
      fullname: formData.fullname,
      shortname: formData.shortname,
      resident: formData.resident,
      phone: formData.phone,
      imageUrl: formData.imageUrl || "", // Store empty string if no URL provided
      status: formData.status,
    };

    // Save to Firestore
    try {
      await addDoc(collection(db, "members"), newMember);
      // onRegister(newMember); // Call the callback with the new member data
      console.log("Submitted Data:", newMember); // Log for debugging
    } catch (err) {
      console.error("Firestore Error:", err.message);
      setError(`Failed to save member data: ${err.message}`);
      return;
    }

    // Reset form
    setFormData({
      fullname: "",
      shortname: "",
      resident: "",
      phone: "",
      imageUrl: "",
      status: "active",
    });
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Register New Member</h2>
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