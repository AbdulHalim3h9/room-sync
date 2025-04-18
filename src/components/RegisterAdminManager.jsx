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
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-6 sm:py-8">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {formData.isAdmin ? "Admin" : "Manager"} Registration
          </h2>
          <p className="text-purple-100 text-sm mt-1 font-medium">
            Create a new account with system access
          </p>
        </div>

        <div className="p-5 sm:p-8">
          <div className="bg-purple-50 border border-purple-100 rounded-xl p-5 mb-6">
            <h3 className="text-sm font-semibold text-purple-800 mb-2">Account Information</h3>
            <p className="text-xs text-purple-700">
              {formData.isAdmin 
                ? "Admin accounts have full system access including user management and critical settings." 
                : "Manager accounts can handle day-to-day operations but have limited access to system settings."}
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold text-gray-800">Full Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="h-11 rounded-lg border-gray-200 focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50 text-base shadow-sm"
                required
              />
              <p className="text-xs text-gray-500">This name will be displayed throughout the system</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="pin" className="text-sm font-semibold text-gray-800">PIN</Label>
                <Input
                  id="pin"
                  name="pin"
                  type="password"
                  value={formData.pin}
                  onChange={handleChange}
                  placeholder="Enter PIN code"
                  className="h-11 rounded-lg border-gray-200 focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50 text-base shadow-sm"
                  required
                />
                <p className="text-xs text-gray-500">Create a secure PIN for authentication</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPin" className="text-sm font-semibold text-gray-800">Confirm PIN</Label>
                <Input
                  id="confirmPin"
                  name="confirmPin"
                  type="password"
                  value={formData.confirmPin}
                  onChange={handleChange}
                  placeholder="Confirm your PIN"
                  className="h-11 rounded-lg border-gray-200 focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50 text-base shadow-sm"
                  required
                />
                <p className="text-xs text-gray-500">Re-enter your PIN to confirm</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
              <div className="space-y-1">
                <Label htmlFor="isAdmin" className="text-sm font-semibold text-gray-800">Register as Admin</Label>
                <p className="text-xs text-gray-500">Toggle to create an admin account with full privileges</p>
              </div>
              <Switch
                id="isAdmin"
                name="isAdmin"
                checked={formData.isAdmin}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, isAdmin: checked }))
                }
                className="data-[state=checked]:bg-purple-600"
              />
            </div>
            
            <div className="pt-4">
              <Button 
                type="submit" 
                className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white text-base font-medium rounded-lg shadow-sm transition-colors duration-200 focus:ring-4 focus:ring-purple-200 focus:ring-opacity-50"
              >
                Register as {formData.isAdmin ? "Admin" : "Manager"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}