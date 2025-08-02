import { useState, useEffect, useCallback } from "react";
import { db } from "@/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

const usePayablesData = (selectedMonth) => {
  const [activeMembers, setActiveMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchActiveMembers = useCallback(async () => {
    setIsLoading(true);
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

      if (membersList.length === 0) {
        toast({
          title: "No Active Members",
          description: `No members are active for ${selectedMonth}.`,
          variant: "destructive",
          className: "z-[1002]",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch active members.",
        variant: "destructive",
        className: "z-[1002]",
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedMonth, toast]);

  useEffect(() => {
    fetchActiveMembers();
  }, [fetchActiveMembers]);

  return { activeMembers, isLoading, toast };
};

export default usePayablesData;