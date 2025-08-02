import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const PayableField = ({ field, fieldIndex, individualIndex, onChange, onRemove, isLoading }) => (
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
          disabled={isLoading}
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
            disabled={isLoading}
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
      disabled={isLoading}
      className="rounded-lg h-11 px-4 bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-700 border-0 shadow-none transition-colors w-full sm:w-auto"
    >
      Remove
    </Button>
  </div>
);

export default PayableField;