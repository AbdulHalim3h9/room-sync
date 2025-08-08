"use client";

import React, { useState, useEffect, useRef } from "react";
import { useFloatingButtons } from "@/contexts/FloatingButtonsContext";
import { CreditCard, X, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { db } from "@/firebase";
import { collection, getDocs, doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { getGlobalFund, deductFromGlobalMealFund } from "@/utils/globalFundManager";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const FloatingDuesButton = () => {
  const [isHighlighted, setIsHighlighted] = useState(false);
  const [animationOffset, setAnimationOffset] = useState({ top: 0, left: 0 });
  const [isDuesOpen, setIsDuesOpen] = useState(false);
  const [dues, setDues] = useState([]);
  const [members, setMembers] = useState({});
  const [selectedDue, setSelectedDue] = useState(null);
  const [showResolveDialog, setShowResolveDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [totalMealFund, setTotalMealFund] = useState(0);
  const { toast } = useToast();
  const buttonRef = useRef(null);
  const { isButtonVisible } = useFloatingButtons();
  const isVisible = isButtonVisible('due') ?? true;

  // Toggle highlight effect every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIsHighlighted((prev) => !prev);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Subtle floating animation
  useEffect(() => {
    const animatePosition = () => {
      const offsets = [
        { top: -2, left: 0 },
        { top: -1, left: 1 },
        { top: 0, left: 2 },
        { top: 1, left: 1 },
        { top: 2, left: 0 },
        { top: 1, left: -1 },
        { top: 0, left: -2 },
        { top: -1, left: -1 }
      ];
      
      let index = 0;
      const interval = setInterval(() => {
        setAnimationOffset(offsets[index]);
        index = (index + 1) % offsets.length;
      }, 500);

      return () => clearInterval(interval);
    };

    animatePosition();
  }, []);

  // Fetch dues, members, and total meal fund
  useEffect(() => {
    const fetchDuesAndMembers = async () => {
      try {
        // Fetch members for name mapping
        const membersRef = collection(db, "members");
        const membersSnapshot = await getDocs(membersRef);
        const membersData = {};
        membersSnapshot.forEach((doc) => {
          const data = doc.data();
          membersData[data.id] = data.fullname;
        });
        setMembers(membersData);

        // Fetch global meal fund (month-independent)
        const globalFund = await getGlobalFund();
        setTotalMealFund(parseFloat(globalFund.totalMealFund || 0));

        // Fetch dues
        const duesRef = collection(db, "dues");
        const duesDocs = await getDocs(duesRef);
        const allDues = [];
        for (const monthDoc of duesDocs.docs) {
          const monthId = monthDoc.id;
          if (!/^\d{4}-\d{2}$/.test(monthId)) {
            console.log(`Skipping invalid monthId: ${monthId}`);
            continue;
          }
          const monthDuesRef = collection(db, "dues", monthId, "dues");
          const monthDuesDocs = await getDocs(monthDuesRef);
          monthDuesDocs.forEach((doc) => {
            const data = doc.data();
            if (data.paymentStatus === "pending") {
              allDues.push({
                id: doc.id,
                monthId,
                ...data,
              });
            }
          });
        }
        // Sort dues by date (newest first)
        allDues.sort((a, b) => new Date(b.date) - new Date(a.date));
        setDues(allDues);
      } catch (error) {
        console.error("Error fetching dues or members: ", error);
        toast({
          title: "Error",
          description: "Failed to fetch dues or member data.",
          variant: "destructive",
          className: "z-[1002]",
        });
      }
    };

    fetchDuesAndMembers();
  }, [toast]);

  const handleResolveDue = (due) => {
    setSelectedDue(due);
    setShowResolveDialog(true);
  };

  const handleViewDetails = (due) => {
    setSelectedDue(due);
    setShowDetailDialog(true);
  };

  const confirmResolveDue = async () => {
    if (!selectedDue) return;

    setIsResolving(true);
    try {
      const dueAmount = selectedDue.amount;
      
      // Check if we have enough funds using global fund
      const globalFund = await getGlobalFund();
      if (globalFund.totalMealFund < dueAmount) {
        toast({
          title: "Insufficient Funds",
          description: `Available: ৳${globalFund.totalMealFund.toLocaleString()}, Required: ৳${dueAmount.toLocaleString()}`,
          variant: "destructive",
          className: "z-[1002]",
        });
        return;
      }

      // Update due status to resolved
      const dueRef = doc(db, "dues", selectedDue.monthId, "dues", selectedDue.id);
      await updateDoc(dueRef, {
        paymentStatus: "resolved",
        resolvedAt: new Date().toISOString(),
      });

      // Update the expense to mark as paid
      const expenseRef = doc(db, "expenses", selectedDue.monthId, "expenses", selectedDue.expenseId);
      await updateDoc(expenseRef, {
        payLater: false,
        paidAt: new Date().toISOString(),
      });

      // Deduct from global meal fund (month-independent)
      const deductionSuccess = await deductFromGlobalMealFund(dueAmount);
      
      if (!deductionSuccess) {
        toast({
          title: "Error",
          description: "Failed to deduct from global meal fund.",
          variant: "destructive",
          className: "z-[1002]",
        });
        return;
      }

      // Recalculate total spendings for the month
      await recalculateTotalSpendings(selectedDue.monthId);

      toast({
        title: "Due Resolved",
        description: `৳${dueAmount.toLocaleString()} deducted from global meal fund`,
        className: "z-[1002]",
      });

      // Refresh dues list and update global fund display
      setDues(prev => prev.filter(due => due.id !== selectedDue.id));
      const updatedGlobalFund = await getGlobalFund();
      setTotalMealFund(updatedGlobalFund.totalMealFund);
      setShowResolveDialog(false);
      setSelectedDue(null);

    } catch (error) {
      console.error("Error resolving due:", error);
      toast({
        title: "Error",
        description: "Failed to resolve due payment.",
        variant: "destructive",
        className: "z-[1002]",
      });
    } finally {
      setIsResolving(false);
    }
  };

  const recalculateTotalSpendings = async (monthId) => {
    try {
      const expensesRef = collection(db, "expenses", monthId, "expenses");
      const querySnapshot = await getDocs(expensesRef);
      const newTotalSpendings = querySnapshot.docs.reduce((sum, doc) => {
        const data = doc.data();
        // Include all expenses (both paid and resolved payLater)
        return sum + (parseInt(data.amountSpent) || 0);
      }, 0);

      const summaryRef = doc(db, "mealSummaries", monthId);
      const summarySnap = await getDoc(summaryRef);
      const existingData = summarySnap.exists() ? summarySnap.data() : {};
      const existingTotalMeals = existingData.totalMealsAllMembers || 0;

      const mealRate =
        existingTotalMeals > 0
          ? (newTotalSpendings / existingTotalMeals).toFixed(2)
          : 0;

      await updateDoc(
        summaryRef,
        {
          totalSpendings: newTotalSpendings,
          mealRate: parseFloat(mealRate),
          lastUpdated: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (error) {
      console.error("Error recalculating total spendings:", error);
    }
  };

  if (!isVisible) return null;

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => setIsDuesOpen(true)}
        className={cn(
          "flex items-center justify-center gap-2",
          "px-3 py-2 rounded-full shadow-lg",
          "hover:scale-105 group transition-all duration-300",
          "text-sm font-medium whitespace-nowrap",
          isHighlighted
            ? "bg-gradient-to-r from-red-500 to-orange-500 text-white"
            : "bg-white text-orange-600",
          isHighlighted ? "ring-2 ring-orange-300 shadow-xl" : "ring-1 ring-gray-200"
        )}
        style={{
          transform: `translate(${animationOffset.left}px, ${animationOffset.top}px)`
        }}
      >
        <CreditCard className="h-4 w-4" />
        <span>বাকি</span>
        {dues.length > 0 && (
          <Badge className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
            {dues.length}
          </Badge>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsVisible(false);
          }}
          className="ml-1 p-1 rounded-full hover:bg-gray-100/50 text-current opacity-60 hover:opacity-100"
        >
          <X className="h-3 w-3" />
        </button>
      </button>

      <Dialog open={isDuesOpen} onOpenChange={setIsDuesOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-blue-800">
              Pending Dues ({dues.length})
            </DialogTitle>
            <div className="text-sm text-gray-600">
              Available Funds: ৳{totalMealFund.toLocaleString()}
            </div>
          </DialogHeader>
          {dues.length === 0 ? (
            <div className="text-center text-gray-500 py-4">
              No pending dues found.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Shopper</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dues.map((due) => (
                  <TableRow key={`${due.monthId}-${due.id}`}>
                    <TableCell>
                      {new Date(due.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-medium">৳{due.amount}</TableCell>
                    <TableCell>
                      {due.shopperId ? members[due.shopperId] || "Unknown" : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={due.expenseType === "groceries" ? "default" : "secondary"}>
                        {due.expenseType === "groceries" ? "Groceries" : "Other"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {due.dueDate ? new Date(due.dueDate).toLocaleDateString() : "-"}
                    </TableCell>
                    <TableCell>
                      {due.priority ? (
                        <Badge 
                          variant={
                            due.priority === "urgent" ? "destructive" :
                            due.priority === "high" ? "default" :
                            due.priority === "medium" ? "secondary" : "outline"
                          }
                        >
                          {due.priority.charAt(0).toUpperCase() + due.priority.slice(1)}
                        </Badge>
                      ) : "-"}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[120px] truncate" title={due.contactInfo || "-"}>
                        {due.contactInfo || "-"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="destructive">Pending</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDetails(due)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          View
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleResolveDue(due)}
                          disabled={totalMealFund < due.amount}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Resolve
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          <DialogFooter>
            <Button 
              onClick={() => setIsDuesOpen(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showResolveDialog} onOpenChange={setShowResolveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Resolve Due Payment
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to resolve this due payment?
              <br />
              <strong>Amount:</strong> ৳{selectedDue?.amount?.toLocaleString()}
              <br />
              <strong>Available Funds:</strong> ৳{totalMealFund.toLocaleString()}
              <br />
              <strong>Remaining After:</strong> ৳{Math.max(0, totalMealFund - (selectedDue?.amount || 0)).toLocaleString()}
              {totalMealFund < (selectedDue?.amount || 0) && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
                  <AlertCircle className="h-4 w-4 text-red-600 inline mr-1" />
                  <span className="text-red-700 text-sm">
                    Warning: Insufficient funds to resolve this due.
                  </span>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isResolving}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmResolveDue}
              disabled={isResolving || totalMealFund < (selectedDue?.amount || 0)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isResolving ? "Resolving..." : "Confirm Resolve"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Detailed View Modal */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-blue-800">
              Due Details
            </DialogTitle>
          </DialogHeader>
          {selectedDue && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-600">Amount</label>
                  <p className="text-lg font-bold text-green-600">৳{selectedDue.amount.toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Date</label>
                  <p className="text-lg">{new Date(selectedDue.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Shopper</label>
                  <p className="text-lg">{selectedDue.shopperId ? members[selectedDue.shopperId] || "Unknown" : "-"}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Type</label>
                  <Badge variant={selectedDue.expenseType === "groceries" ? "default" : "secondary"}>
                    {selectedDue.expenseType === "groceries" ? "Groceries" : "Other"}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Due Date</label>
                  <p className="text-lg">{selectedDue.dueDate ? new Date(selectedDue.dueDate).toLocaleDateString() : "Not set"}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Priority</label>
                  {selectedDue.priority ? (
                    <Badge 
                      variant={
                        selectedDue.priority === "urgent" ? "destructive" :
                        selectedDue.priority === "high" ? "default" :
                        selectedDue.priority === "medium" ? "secondary" : "outline"
                      }
                    >
                      {selectedDue.priority.charAt(0).toUpperCase() + selectedDue.priority.slice(1)}
                    </Badge>
                  ) : (
                    <p className="text-lg">Not set</p>
                  )}
                </div>
              </div>
              
              {selectedDue.dueNote && (
                <div>
                  <label className="text-sm font-semibold text-gray-600">Due Note</label>
                  <p className="text-lg bg-gray-50 p-3 rounded-lg border">{selectedDue.dueNote}</p>
                </div>
              )}
              
              {selectedDue.contactInfo && (
                <div>
                  <label className="text-sm font-semibold text-gray-600">Contact Information</label>
                  <p className="text-lg bg-blue-50 p-3 rounded-lg border">{selectedDue.contactInfo}</p>
                </div>
              )}
              
              {selectedDue.expenseTitle && (
                <div>
                  <label className="text-sm font-semibold text-gray-600">Expense Title</label>
                  <p className="text-lg">{selectedDue.expenseTitle}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button 
              onClick={() => setShowDetailDialog(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FloatingDuesButton;