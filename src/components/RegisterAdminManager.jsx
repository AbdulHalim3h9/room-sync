import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
// Import Firebase
import { initializeApp } from "firebase/app";
import { db } from "@/firebase"; // Adjust the path to your Firebase config
import { getFirestore, doc, setDoc } from "firebase/firestore";

export default function RegistrationForm() {
  const [formData, setFormData] = useState({
    name: "",
    pin: "",
    confirmPin: "",
    isAdmin: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.pin !== formData.confirmPin) {
      alert("Pins do not match!");
      return;
    }

    try {
      const role = formData.isAdmin ? "Admin" : "Manager";
      const userData = {
        name: formData.name,
        role: role,
        pin: formData.pin,
        registeredAt: new Date().toISOString()
      };

      // Reference to the single document that will store all users
      const usersDocRef = doc(db, "users", "allUsers");

      // We'll use an object structure to store admins and managers separately
      await setDoc(usersDocRef, {
        [role === "Admin" ? "admins" : "managers"]: {
          [formData.name]: userData
        }
      }, { merge: true }); // merge: true prevents overwriting existing data

      console.log("Registered as:", role, formData.name);
      alert("Registration successful!");
      
      // Reset form
      setFormData({
        name: "",
        pin: "",
        confirmPin: "",
        isAdmin: false,
      });

    } catch (error) {
      console.error("Error registering user:", error);
      alert("Registration failed. Please try again.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-2xl shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Register</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="pin">PIN</Label>
          <Input
            id="pin"
            name="pin"
            type="password"
            value={formData.pin}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="confirmPin">Confirm PIN</Label>
          <Input
            id="confirmPin"
            name="confirmPin"
            type="password"
            value={formData.confirmPin}
            onChange={handleChange}
            required
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="isAdmin">Register as Admin</Label>
          <Switch
            id="isAdmin"
            name="isAdmin"
            checked={formData.isAdmin}
            onCheckedChange={(checked) =>
              setFormData((prev) => ({ ...prev, isAdmin: checked }))
            }
          />
        </div>
        <Button type="submit" className="w-full">
          Register
        </Button>
      </form>
    </div>
  );
}