import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const CarryforwardPopup = ({ month, carryforwardData }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Info className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Monthly Carryforward Details</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {carryforwardData.calculations.map((calculation, index) => (
            <Card key={index} className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">Member {index + 1}</h3>
                  <p className="text-sm text-muted-foreground">
                    Total Meals: {calculation.totalMeals}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge variant={calculation.dues > 0 ? "destructive" : "default"}>
                    Dues: {calculation.dues.toFixed(2)} tk
                  </Badge>
                  <Badge variant={calculation.awes > 0 ? "success" : "default"}>
                    Awes: {calculation.awes.toFixed(2)} tk
                  </Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
        <div className="mt-4 flex justify-between items-center">
          <div>
            <h4 className="font-medium">Summary</h4>
            <p className="text-sm text-muted-foreground">
              Meal Rate: {carryforwardData.mealRate.toFixed(2)} tk
            </p>
            <p className="text-sm text-muted-foreground">
              Total Meals: {carryforwardData.totalMealsAllMembers}
            </p>
            <p className="text-sm text-muted-foreground">
              Total Spendings: {carryforwardData.totalSpendings.toFixed(2)} tk
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

