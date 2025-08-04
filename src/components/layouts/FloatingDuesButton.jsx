"use client";

import React, { useState, useEffect, useRef } from "react";
import { useFloatingButtons } from "@/contexts/FloatingButtonsContext";
import { CreditCard, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { db } from "@/firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const FloatingDuesButton = () => {
  const [isHighlighted, setIsHighlighted] = useState(false);
  const [animationOffset, setAnimationOffset] = useState({ top: 0, left: 0 });
  const [isDuesOpen, setIsDuesOpen] = useState(false);
  const [dues, setDues] = useState([]);
  const [members, setMembers] = useState({});
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

  // Fetch dues and members
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
            allDues.push({
              id: doc.id,
              monthId,
              ...data,
            });
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
              Pending Dues
            </DialogTitle>
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
                  <TableHead>Title</TableHead>
                  <TableHead>Due Note</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dues.map((due) => (
                  <TableRow key={`${due.monthId}-${due.id}`}>
                    <TableCell>
                      {new Date(due.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>৳{due.amount}</TableCell>
                    <TableCell>
                      {due.shopperId ? members[due.shopperId] || "Unknown" : "-"}
                    </TableCell>
                    <TableCell>
                      {due.expenseType === "groceries" ? "Groceries" : "Other"}
                    </TableCell>
                    <TableCell>{due.expenseTitle || "-"}</TableCell>
                    <TableCell>{due.dueNote || "-"}</TableCell>
                    <TableCell>{due.paymentStatus}</TableCell>
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
    </>
  );
};

export default FloatingDuesButton;