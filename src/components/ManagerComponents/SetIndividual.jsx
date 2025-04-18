"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { db } from "@/firebase";
import {
  collection,
  getDoc,
  setDoc,
  doc,
  getDocs,
} from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

const PayableField = ({ field, fieldIndex, individualIndex, onChange, onRemove }) => (
  <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 p-4 border border-gray-100 rounded-lg bg-gray-50">
    <div className="flex-1 space-y-4 w-full">
      <div className="space-y-2">
        <Label htmlFor={`title-${individualIndex}-${fieldIndex}`} className="block text-sm font-semibold text-gray-800">
          Title
        </Label>
        <Input
          id={`title-${individualIndex}-${fieldIndex}`}
          name="title"
          type="text"
          value={field.title}
          onChange={(e) => onChange(e, fieldIndex)}
          placeholder="E.g., Internet Bill, Special Charge"
          className="h-11 rounded-lg border-gray-200 focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50 text-base shadow-sm"
        />
        <p className="text-xs text-gray-500 mt-1">Enter a descriptive name for this payable</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`amount-${individualIndex}-${fieldIndex}`} className="block text-sm font-semibold text-gray-800">
          Amount
        </Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">৳</span>
          </div>
          <Input
            id={`amount-${individualIndex}-${fieldIndex}`}
            name="amount"
            type="number"
            value={field.amount}
            onChange={(e) => onChange(e, fieldIndex)}
            placeholder="Enter amount"
            className="pl-8 h-11 rounded-lg border-gray-200 focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50 text-base [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none shadow-sm"
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">Amount in BDT</p>
      </div>
    </div>
    <Button
      type="button"
      onClick={() => onRemove(fieldIndex)}
      variant="destructive"
      className="rounded-lg h-11 px-4 bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-700 border-0 shadow-none transition-colors w-full sm:w-auto"
    >
      Remove
    </Button>
  </div>
);

const IndividualSection = ({ individual, index, activeMembers, onChange, onAddField, onRemoveField }) => (
  <div className="space-y-5 mb-8 border border-purple-100 p-5 rounded-xl bg-white shadow-sm">
    <div className="flex items-center justify-between">
      <h3 className="text-base font-semibold text-purple-800">Individual #{index + 1}</h3>
      <div className="bg-purple-100 text-purple-800 text-xs font-semibold px-2.5 py-1 rounded-full">
        {individual.fields.length} item{individual.fields.length !== 1 ? 's' : ''}
      </div>
    </div>
    
    <div className="space-y-2">
      <Label htmlFor={`member-${index}`} className="block text-sm font-semibold text-gray-800">
        Member
      </Label>
      <Select
        value={individual.member}
        onValueChange={(value) => onChange({ target: { name: "member", value } }, index)}
      >
        <SelectTrigger
          id={`member-${index}`}
          className="h-11 rounded-lg border-gray-200 focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50 text-base shadow-sm"
        >
          <SelectValue placeholder="Select a member" />
        </SelectTrigger>
        <SelectContent className="rounded-lg border-gray-200 shadow-lg">
          {activeMembers.length > 0 ? (
            activeMembers.map((member) => (
              <SelectItem 
                key={member.id} 
                value={member.name}
                className="py-2.5 text-base font-medium"
              >
                {member.name}
              </SelectItem>
            ))
          ) : (
            <div className="px-4 py-3 text-sm text-gray-500 text-center">
              No active members for this month
            </div>
          )}
        </SelectContent>
      </Select>
      <p className="text-xs text-gray-500 mt-1">Select the member who will be charged</p>
    </div>
    
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700">Payable Items</h4>
        <Button
          type="button"
          onClick={() => onAddField(index)}
          className="bg-purple-100 hover:bg-purple-200 text-purple-700 hover:text-purple-800 border-0 text-xs px-3 py-1 h-7 rounded-full shadow-none transition-colors"
        >
          + Add Item
        </Button>
      </div>
      
      {individual.fields.length === 0 && (
        <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-200">
          <p className="text-sm text-gray-500">No payable items added yet</p>
          <p className="text-xs text-gray-400 mt-1">Click "Add Item" to add a new payable</p>
        </div>
      )}
      
      {individual.fields.map((field, fieldIndex) => (
        <PayableField
          key={fieldIndex}
          field={field}
          fieldIndex={fieldIndex}
          individualIndex={index}
          onChange={(e, idx) => {
            const updatedIndividuals = [...individual.fields];
            updatedIndividuals[idx][e.target.name] = e.target.value;
            onChange({ target: { name: "fields", value: updatedIndividuals } }, index);
          }}
          onRemove={(idx) => onRemoveField(index, idx)}
        />
      ))}
    </div>
  </div>
);

const IndividualPayablesForm = ({ selectedMonth }) => {
  const [individuals, setIndividuals] = useState([
    { member: "", fields: [{ title: "", amount: "" }] },
  ]);
  const [activeMembers, setActiveMembers] = useState([]);
  const { toast } = useToast();

  const fetchActiveMembers = useCallback(async () => {
    try {
      const membersCollectionRef = collection(db, "members");
      const querySnapshot = await getDocs(membersCollectionRef);
      const membersList = querySnapshot.docs
        .map((doc) => ({
          id: doc.data().id,
          name: doc.data().fullname,
          resident: doc.data().resident,
          activeFrom: doc.data().activeFrom,
          archiveFrom: doc.data().archiveFrom,
        }))
        .filter((member) => {
          if (!member.activeFrom) return false;
          const activeFromDate = new Date(member.activeFrom + "-01");
          const selectedMonthDate = new Date(selectedMonth + "-01");
          if (activeFromDate > selectedMonthDate) return false;
          if (member.archiveFrom) {
            const archiveFromDate = new Date(member.archiveFrom + "-01");
            return selectedMonthDate < archiveFromDate;
          }
          return true;
        })
        .sort((a, b) => a.name.localeCompare(b.name));
      setActiveMembers(membersList);
      console.log("Fetched active members for", selectedMonth, ":", membersList);
      if (membersList.length === 0) {
        toast({
          title: "No Active Members",
          description: `No members are active for ${selectedMonth}.`,
          variant: "destructive",
          className: "z-[1002]",
        });
      }
    } catch (error) {
      console.error("Error fetching active members:", error);
      toast({
        title: "Error",
        description: "Failed to fetch active members.",
        variant: "destructive",
        className: "z-[1002]",
      });
    }
  }, [selectedMonth, toast]);

  useEffect(() => {
    fetchActiveMembers();
  }, [fetchActiveMembers]);

  const handleIndividualChange = (e, index) => {
    const updatedIndividuals = [...individuals];
    updatedIndividuals[index][e.target.name] = e.target.value;
    setIndividuals(updatedIndividuals);
  };

  const handleAddField = (index) => {
    const updatedIndividuals = [...individuals];
    updatedIndividuals[index].fields.push({ title: "", amount: "" });
    setIndividuals(updatedIndividuals);
  };

  const handleRemoveField = (individualIndex, fieldIndex) => {
    const updatedIndividuals = [...individuals];
    updatedIndividuals[individualIndex].fields.splice(fieldIndex, 1);
    setIndividuals(updatedIndividuals);
  };

  const handleAddIndividual = () => {
    setIndividuals([
      ...individuals,
      { member: "", fields: [{ title: "", amount: "" }] },
    ]);
  };

  const validateForm = () => {
    const errors = [];
    individuals.forEach((individual, index) => {
      if (!individual.member) {
        errors.push(`Member ${index + 1}`);
      }
      individual.fields.forEach((field, fieldIndex) => {
        if (!field.title) {
          errors.push(`Title for field ${fieldIndex + 1} of Member ${index + 1}`);
        }
        if (!field.amount) {
          errors.push(`Amount for field ${fieldIndex + 1} of Member ${index + 1}`);
        } else if (!/^\d+$/.test(field.amount)) {
          errors.push(
            `Amount for field ${fieldIndex + 1} of Member ${index + 1} must be a number`
          );
        }
      });
    });
    return errors;
  };

  const calculateTotalAmount = () =>
    individuals.reduce(
      (total, ind) =>
        total +
        ind.fields.reduce((sum, field) => sum + (parseInt(field.amount) || 0), 0),
      0
    );

  const handleSubmit = async () => {
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      toast({
        title: "Validation Error",
        description: validationErrors.join(", ") + " is required.",
        variant: "destructive",
        className: "z-[1002]",
      });
      return;
    }

    try {
      const docRef = doc(db, "payables", selectedMonth);
      const docSnap = await getDoc(docRef);
      let existingBills = docSnap.exists() ? docSnap.data().bills || [] : [];

      const newIndividualBills = individuals.map((individual) => {
        const selectedMember = activeMembers.find(
          (member) => member.name === individual.member
        );
        return {
          id: selectedMember?.id || "",
          name: individual.member,
          status: "Pending",
          payables: individual.fields.map((field) => ({
            name: field.title,
            amount: parseInt(field.amount) || 0,
          })),
        };
      });

      const updatedBills = activeMembers.map((member) => {
        const newBill = newIndividualBills.find((bill) => bill.id === member.id);
        return newBill || existingBills.find((bill) => bill.id === member.id) || {
          id: member.id,
          name: member.name,
          status: "Pending",
          payables: [],
        };
      });

      await setDoc(docRef, { bills: updatedBills }, { merge: true });

      toast({
        title: "Success",
        description: `Individual payables for ${selectedMonth} have been set.`,
        className: "z-[1002]",
      });

      setIndividuals([{ member: "", fields: [{ title: "", amount: "" }] }]);
    } catch (error) {
      console.error("Error uploading/updating data:", error);
      toast({
        title: "Error",
        description: "Failed to set individual payables. Please try again.",
        variant: "destructive",
        className: "z-[1002]",
      });
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-6 sm:py-8">
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Set Individual Payables for {selectedMonth}
          </h1>
          <p className="text-purple-100 text-sm mt-1 font-medium">
            Add custom charges for specific members
          </p>
        </div>

        <div className="p-5 sm:p-8">
          <div className="bg-purple-50 border border-purple-100 rounded-xl p-5 mb-6">
            <h3 className="text-sm font-semibold text-purple-800 mb-2">About Individual Payables</h3>
            <p className="text-xs text-purple-700">Use this form to add specific charges that apply to individual members only, such as internet bills or special charges.</p>
          </div>
          
          {individuals.map((individual, index) => (
            <IndividualSection
              key={index}
              individual={individual}
              index={index}
              activeMembers={activeMembers}
              onChange={handleIndividualChange}
              onAddField={handleAddField}
              onRemoveField={handleRemoveField}
            />
          ))}
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6 mb-8">
            <Button
              type="button"
              onClick={handleAddIndividual}
              variant="outline"
              className="border border-purple-200 text-purple-700 hover:bg-purple-50 rounded-lg h-11 shadow-sm transition-colors"
            >
              + Add Another Member
            </Button>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 flex items-center">
              <span className="text-sm text-gray-600 mr-2">Total:</span>
              <span className="font-bold text-lg text-gray-900">৳ {calculateTotalAmount()}</span>
            </div>
          </div>
          
          <div className="pt-4">
            <Button
              type="button"
              onClick={handleSubmit}
              className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white text-base font-medium rounded-lg shadow-sm transition-colors duration-200 focus:ring-4 focus:ring-purple-200 focus:ring-opacity-50"
              disabled={activeMembers.length === 0}
            >
              Save Individual Payables
            </Button>
            {activeMembers.length === 0 && (
              <p className="text-xs text-center text-red-500 mt-2">
                No active members for the selected month
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndividualPayablesForm;