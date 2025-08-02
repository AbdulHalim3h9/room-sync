import { useState, useEffect } from "react";
import { db } from "@/firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

const useMealFundData = (month, selectedDonor) => {
  const [members, setMembers] = useState([]);
  const [previousAmount, setPreviousAmount] = useState(0);
  const [previousMonthDues, setPreviousMonthDues] = useState(null);
  const [isFirstEntry, setIsFirstEntry] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const membersRef = collection(db, "members");
        const querySnapshot = await getDocs(membersRef);
        const membersData = querySnapshot.docs
          .map((doc) => ({
            member_id: doc.data().id,
            member_name: doc.data().fullname,
            activeFrom: doc.data().activeFrom,
            archiveFrom: doc.data().archiveFrom,
          }))
          .filter((member) => {
            if (!member.activeFrom) return false;
            const activeFromDate = new Date(member.activeFrom + "-01");
            const selectedMonthDate = new Date(month + "-01");
            if (activeFromDate > selectedMonthDate) return false;
            if (member.archiveFrom) {
              const archiveFromDate = new Date(member.archiveFrom + "-01");
              return selectedMonthDate < archiveFromDate;
            }
            return true;
          })
          .sort((a, b) => a.member_name.localeCompare(b.member_name));
        setMembers(membersData);
        if (membersData.length === 0) {
          toast({
            title: "No Active Members",
            description: `No members are active for ${month}.`,
            variant: "destructive",
            className: "z-[1002]",
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch members.",
          variant: "destructive",
          className: "z-[1002]",
        });
      }
    };

    fetchMembers();
  }, [month, toast]);

  useEffect(() => {
    if (!selectedDonor || !month) {
      setIsFirstEntry(false);
      setPreviousMonthDues(null);
      return;
    }

    const checkFirstEntryAndBalance = async () => {
      try {
        const docId = `${month}-${selectedDonor}`;
        const docRef = doc(db, "meal_funds", docId);
        const docSnap = await getDoc(docRef);
        setIsFirstEntry(!docSnap.exists());

        const previousMonthDate = new Date(month + "-01");
        previousMonthDate.setMonth(previousMonthDate.getMonth() - 1);
        const previousMonth = previousMonthDate.toISOString().split("T")[0].split("-").slice(0, 2).join("-");
        
        const contribConsumpRef = collection(db, "contributionConsumption");
        const contribSnapshot = await getDocs(contribConsumpRef);
        
        let previousBalance = 0;
        contribSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.month === previousMonth && data.member === selectedDonor) {
            const contribution = data.contribution || 0;
            const consumption = data.consumption || 0;
            previousBalance = contribution - consumption;
          }
        });

        setPreviousMonthDues(previousBalance);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to check previous month's balance.",
          variant: "destructive",
          className: "z-[1002]",
        });
      }
    };

    checkFirstEntryAndBalance();
  }, [selectedDonor, month, toast]);

  useEffect(() => {
    if (!selectedDonor || !month) {
      setPreviousAmount(0);
      return;
    }

    const fetchPreviousAmount = async () => {
      const docId = `${month}-${selectedDonor}`;
      const docRef = doc(db, "meal_funds", docId);
      try {
        const docSnap = await getDoc(docRef);
        const totalAmount = docSnap.exists() ? docSnap.data().amount || 0 : 0;
        setPreviousAmount(totalAmount);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch previous donation amount.",
          variant: "destructive",
          className: "z-[1002]",
        });
      }
    };

    fetchPreviousAmount();
  }, [selectedDonor, month, toast]);

  return { members, previousAmount, previousMonthDues, isFirstEntry, toast };
};

export default useMealFundData;