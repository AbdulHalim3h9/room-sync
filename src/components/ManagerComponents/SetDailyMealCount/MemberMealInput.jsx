import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const MemberMealInput = ({ member, mealCount, onChange }) => (
  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-semibold text-sm">
        {member.name.charAt(0)}
      </div>
      <Label 
        htmlFor={`member-${member.id}`} 
        className="text-sm font-medium text-gray-800 cursor-pointer"
      >
        {member.name}
      </Label>
    </div>
    
    <div className="relative w-full sm:w-auto">
      <Input
        id={`member-${member.id}`}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={mealCount || ""}
        onChange={(e) => onChange(e, member.id)}
        placeholder="0"
        className="w-full sm:w-24 h-10 text-center font-medium text-gray-800 rounded-lg border-gray-200 focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none shadow-sm"
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none sm:hidden">
        meals
      </div>
    </div>
  </div>
);

export default MemberMealInput;