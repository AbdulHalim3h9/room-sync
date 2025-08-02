import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PayableField from "./PayableField";

const IndividualSection = ({ individual, index, activeMembers, onChange, onAddField, onRemoveField, onRemoveIndividual, isLoading }) => {
  const calculateIndividualTotal = () =>
    individual.fields.reduce((sum, field) => sum + (parseInt(field.amount) || 0), 0);

  return (
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
          disabled={isLoading}
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
            disabled={isLoading}
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
              const updatedFields = [...individual.fields];
              updatedFields[idx][e.target.name] = e.target.value;
              onChange({ target: { name: "fields", value: updatedFields } }, index);
            }}
            onRemove={(idx) => onRemoveField(index, idx)}
            isLoading={isLoading}
          />
        ))}
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-600">Total for Individual #{index + 1}:</span>
        <span className="font-bold text-xl text-gray-900">৳ {calculateIndividualTotal()}</span>
      </div>

      <div className="pt-2">
        <Button
          type="button"
          onClick={() => onRemoveIndividual(index)}
          variant="destructive"
          disabled={isLoading}
          className="w-full sm:w-auto h-11 px-4 bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-700 border-0 shadow-none transition-colors"
        >
          Remove Individual
        </Button>
      </div>
    </div>
  );
};

export default IndividualSection;