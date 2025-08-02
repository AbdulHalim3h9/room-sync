"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import IndividualSection from "./IndividualSection";
import usePayablesData from "./usePayablesData";
import { validateForm, handleSubmit } from "./payablesUtils";

const IndividualPayablesForm = ({ selectedMonth }) => {
  const [individuals, setIndividuals] = useState([
    { member: "", fields: [{ title: "", amount: "" }] },
  ]);
  const { activeMembers, isLoading, toast } = usePayablesData(selectedMonth);

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

  const handleRemoveIndividual = (index) => {
    if (individuals.length === 1) {
      toast({
        title: "Cannot Remove",
        description: "At least one individual section is required.",
        variant: "destructive",
        className: "z-[1002]",
      });
      return;
    }
    const updatedIndividuals = [...individuals];
    updatedIndividuals.splice(index, 1);
    setIndividuals(updatedIndividuals);
  };

  const onSubmit = () => {
    handleSubmit(selectedMonth, individuals, activeMembers, setIndividuals, toast, setIsLoading);
  };

  return (
    <div>
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="p-5 sm:p-6">
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
              onRemoveIndividual={handleRemoveIndividual}
              isLoading={isLoading}
            />
          ))}
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6 mb-8">
            <Button
              type="button"
              onClick={handleAddIndividual}
              variant="outline"
              disabled={isLoading}
              className="border border-purple-200 text-purple-700 hover:bg-purple-50 rounded-lg h-11 shadow-sm transition-colors"
            >
              + Add Another Member
            </Button>
          </div>
          
          <div className="pt-4">
            <Button
              type="button"
              onClick={onSubmit}
              className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white text-base font-medium rounded-lg shadow-sm transition-colors duration-200 focus:ring-4 focus:ring-purple-200 focus:ring-opacity-50"
              disabled={activeMembers.length === 0 || isLoading}
            >
              {isLoading ? "Processing..." : "Save Individual Payables"}
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