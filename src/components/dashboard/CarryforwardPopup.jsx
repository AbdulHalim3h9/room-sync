import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, subMonths } from 'date-fns';

export const CarryforwardPopup = ({ month, carryforwardData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [previousMonth, setPreviousMonth] = useState(null);

  useEffect(() => {
    if (month) {
      const prevMonth = subMonths(new Date(month), 1);
      setPreviousMonth(prevMonth);
    }
  }, [month]);

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        className="ml-2"
      >
        <Info className="w-4 h-4" />
      </Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Monthly Carryforward Details</DialogTitle>
            <p className="text-sm text-muted-foreground">
              {previousMonth ? format(previousMonth, 'MMMM yyyy') : 'Loading...'}
            </p>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {carryforwardData?.calculations?.length > 0 ? (
              carryforwardData.calculations.map((calculation, index) => (
                <Card key={index} className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">Member {index + 1}</h3>
                      <p className="text-sm text-muted-foreground">
                        Total Meals: {calculation.totalMeals ?? 0}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={calculation.dues > 0 ? "destructive" : "default"}>
                        Dues: {(calculation.dues ?? 0).toFixed(2)} tk
                      </Badge>
                      <Badge variant={calculation.awes > 0 ? "success" : "default"}>
                        Awes: {(calculation.awes ?? 0).toFixed(2)} tk
                      </Badge>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <p className="text-sm text-muted-foreground col-span-2">No carryforward data available</p>
            )}
          </div>
          <div className="mt-4 flex justify-between items-center">
            <div>
              <h4 className="font-medium">Summary</h4>
              <p className="text-sm text-muted-foreground">
                Meal Rate: {(carryforwardData?.mealRate ?? 0).toFixed(2)} tk
              </p>
              <p className="text-sm text-muted-foreground">
                Total Meals: {carryforwardData?.totalMealsAllMembers ?? 0}
              </p>
              <p className="text-sm text-muted-foreground">
                Total Spendings: {(carryforwardData?.totalSpendings ?? 0).toFixed(2)} tk
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};