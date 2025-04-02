import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select,
       SelectTrigger, 
       SelectContent, 
       SelectItem, 
       SelectValue } from "@/components/ui/select";

const RegisterMember = ({ onRegister }) => {
  const [formData, setFormData] = useState({
    fullname: "",
    shortname: "",
    resident: "",
    phone: "",
    image: null,
  });

  const [previewImage, setPreviewImage] = useState(null);

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

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitted Data:", formData);
    onRegister(formData);
    setFormData({ fullname: "", shortname: "", resident: "", phone: "", image: null });
    setPreviewImage(null);
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Register New Member</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        
        <div>
          <Label>Full Name</Label>
          <Input name="fullname" value={formData.fullname} onChange={handleChange} placeholder="Enter full name" />
        </div>

        <div>
          <Label>Short Name</Label>
          <Input name="shortname" value={formData.shortname} onChange={handleChange} placeholder="Enter short name" />
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
          <Input name="phone" value={formData.phone} onChange={handleChange} placeholder="Enter phone number" type="tel" />
        </div>

        <div>
          <Label>Upload Image</Label>
          <Input type="file" accept="image/*" onChange={handleImageUpload} />
          {previewImage && <img src={previewImage} alt="Preview" className="w-20 h-20 mt-2 rounded-full" />}
        </div>

        <Button type="submit" className="bg-blue-500 text-white">
          Register Member
        </Button>
      </form>
    </div>
  );
};

export default RegisterMember;
