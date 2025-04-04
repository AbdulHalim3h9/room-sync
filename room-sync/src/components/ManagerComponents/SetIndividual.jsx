"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { db } from "@/firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
} from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

const SetIndividual = ({ selectedMonth }) => {
  const [individuals, setIndividuals] = useState([
    { member: "", fields: [{ title: "", amount: "" }] },
  ]);
  const [activeMembers, setActiveMembers] = useState([]);

  const { toast } = useToast();

  useEffect(() => {
    const fetchActiveMembers = async () => {
      try {
        const membersCollectionRef = collection(db, "members");
        const q = query(membersCollectionRef, where("status", "==", "active"));
        const querySnapshot = await getDocs(q);
        const membersList = querySnapshot.docs.map((doc) => ({
          id: doc.data().id,
          name: doc.data().fullname,
          resident: doc.data().resident,
        }));
        setActiveMembers(membersList);
      } catch (error) {
        console.error("Error fetching active members: ", error);
        toast({
          title: "Error",
          description: "Failed to fetch active members.",
          variant: "destructive",
        });
      }
    };

    fetchActiveMembers();
  }, [toast]);

  const handleIndividualChange = (index, e) => {
    const updatedIndividuals = [...individuals];
    updatedIndividuals[index][e.target.name] = e.target.value;
    setIndividuals(updatedIndividuals);
  };

  const handleFieldChange = (individualIndex, fieldIndex, e) => {
    const updatedIndividuals = [...individuals];
    updatedIndividuals[individualIndex].fields[fieldIndex][e.target.name] =
      e.target.value;
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

  const handleSubmit = async () => {
    const validationErrors = [];
    individuals.forEach((individual, index) => {
      if (!individual.member) {
        validationErrors.push(`Member ${index + 1}`);
      }
      individual.fields.forEach((field, fieldIndex) => {
        if (!field.title) {
          validationErrors.push(
            `Title for field ${fieldIndex + 1} of Member ${index + 1}`
          );
        }
        if (!field.amount) {
          validationErrors.push(
            `Amount for field ${fieldIndex + 1} of Member ${index + 1}`
          );
        } else if (!/^\d+$/.test(field.amount)) {
          validationErrors.push(
            `Amount for field ${fieldIndex + 1} of Member ${index + 1} must be a number`
          );
        }
      });
    });

    if (validationErrors.length > 0) {
      toast({
        title: "Validation Error",
        description: validationErrors.join(", ") + " is required.",
        variant: "destructive",
      });
      return;
    }

    try {
      const billsCollectionRef = collection(db, "payables");
      const q = query(billsCollectionRef, where("month", "==", selectedMonth));
      const querySnapshot = await getDocs(q);
      let existingBills = [];

      if (!querySnapshot.empty) {
        existingBills = querySnapshot.docs[0].data().bills || [];
      }

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
        const newBill = newIndividualBills.find(
          (bill) => bill.id === member.id
        );
        if (newBill) {
          return newBill;
        }
        return (
          existingBills.find((bill) => bill.id === member.id) || {
            id: member.id,
            name: member.name,
            status: "Pending",
            payables: [],
          }
        );
      });

      const billData = {
        month: selectedMonth,
        bills: updatedBills,
      };

      if (!querySnapshot.empty) {
        const docId = querySnapshot.docs[0].id;
        const docRef = doc(db, "payables", docId);
        await updateDoc(docRef, billData);
        toast({
          title: "Success!",
          description: "Individual payables have been successfully updated.",
          variant: "success",
        });
      } else {
        await addDoc(billsCollectionRef, billData);
        toast({
          title: "Success!",
          description: "Individual payables have been successfully set.",
          variant: "success",
        });
      }

      setIndividuals([{ member: "", fields: [{ title: "", amount: "" }] }]);
    } catch (error) {
      console.error("Error uploading/updating data: ", error);
      toast({
        title: "Error",
        description: "Failed to set/update individual payables. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6">
      <h1 className="text-xl font-bold mb-6">
        Set Individual Payables for {selectedMonth}
      </h1>

      {individuals.map((individual, index) => (
        <div key={index} className="space-y-4 mb-6 border p-4 rounded-md">
          <div>
            <Label htmlFor={`member-${index}`} className="block mb-1">
              Member
            </Label>
            <select
              id={`member-${index}`}
              name="member"
              value={individual.member}
              onChange={(e) => handleIndividualChange(index, e)}
              className="w-full border px-3 py-2 rounded-md"
            >
              <option value="">Select a member</option>
              {activeMembers.map((member) => (
                <option key={member.id} value={member.name}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>

          {individual.fields.map((field, fieldIndex) => (
            <div key={fieldIndex} className="space-y-4">
              <div className="flex items-end gap-4">
                <div className="flex-1">
                  <div>
                    <Label
                      htmlFor={`title-${index}-${fieldIndex}`}
                      className="block mb-1"
                    >
                      Title
                    </Label>
                    <Input
                      id={`title-${index}-${fieldIndex}`}
                      name="title"
                      type="text"
                      value={field.title}
                      onChange={(e) => handleFieldChange(index, fieldIndex, e)}
                      placeholder="Enter title"
                      className="w-full mb-2"
                    />
                  </div>

                  <Label
                    htmlFor={`amount-${index}-${fieldIndex}`}
                    className="block mb-1"
                  >
                    Amount
                  </Label>
                  <Input
                    id={`amount-${index}-${fieldIndex}`}
                    name="amount"
                    type="number"
                    value={field.amount}
                    onChange={(e) => handleFieldChange(index, fieldIndex, e)}
                    placeholder="Enter amount"
                    className="w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>

                <div>
                  <Button
                    type="button"
                    onClick={() => handleRemoveField(index, fieldIndex)}
                    variant="destructive"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          ))}

          <div className="mt-4">
            <Button type="button" onClick={() => handleAddField(index)}>
              Add Field
            </Button>
          </div>
        </div>
      ))}

      <div className="mt-4">
        <Button type="button" onClick={handleAddIndividual} variant="outline">
          Add Another Individual
        </Button>
      </div>

      <div className="font-bold text-lg mt-6">
        Total Amount:{" "}
        {individuals.reduce(
          (total, ind) =>
            total +
            ind.fields.reduce(
              (sum, field) => sum + (parseInt(field.amount) || 0),
              0
            ),
          0
        )}{" "}
        tk
      </div>

      <div className="mt-6">
        <Button type="button" onClick={handleSubmit} className="w-full">
          Submit
        </Button>
      </div>
    </div>
  );
};

export default SetIndividual;