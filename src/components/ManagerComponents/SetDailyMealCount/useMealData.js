import { useState, useEffect, useCallback } from "react";
import { db } from "@/firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const useMealData = (selectedDate, mealCounts, setMealCounts) => {
  const [members, setMembers] = useState([]);
  const [datesWithData, setDatesWithData] = useState([]);
  const [existingDocId, setExistingDocId] = useState(null);
  const { toast } = useToast();

  const fetchMembersAndDates = useCallback(async () => {
    try {
      const selectedMonth = format(selectedDate, "yyyy-MM");
      const membersRef = collection(db, "members");
      const querySnapshot = await getDocs(membersRef);
      const membersData = querySnapshot.docs
        .map((doc) => {
          const data = doc.data();
          if (!data.id || !data.fullname) return null;
          return {
            id: data.id,
            name: data.fullname,
            activeFrom: data.activeFrom,
            archiveFrom: data.archiveFrom,
          };
        })
        .filter((member) => {
          if (!member || !member.activeFrom) return false;
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

      if (membersData.length === 0) {
        toast({
          title: "No Active Members",
          description: `No members are active for ${selectedMonth}.`,
          variant: "destructive",
        });
      }

      setMembers(membersData);
      setMealCounts(
        Object.fromEntries(membersData.map((member) => [member.id, ""]))
      );

      const individualMealsRef = collection(db, "individualMeals");
      const mealDocs = await getDocs(individualMealsRef);
      const dates = new Set();

      for (const monthDoc of mealDocs.docs) {
        const month = monthDoc.id;
        if (!/^\d{4}-\d{2}$/.test(month)) continue;
        const data = monthDoc.data();
        Object.values(data.mealCounts || {}).forEach((meals) => {
          meals.forEach((entry) => {
            if (!entry.startsWith("Total")) {
              const [day] = entry.split(" ");
              const dateStr = `${month}-${day.padStart(2, "0")}`;
              const date = new Date(dateStr);
              if (!isNaN(date.getTime())) dates.add(date.getTime());
            }
          });
        });
      }

      setDatesWithData(Array.from(dates).map((time) => new Date(time)));
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch members or meal data.",
        variant: "destructive",
      });
    }
  }, [selectedDate, setMealCounts, toast]);

  const fetchMealCounts = useCallback(async () => {
    try {
      const monthKey = format(selectedDate, "yyyy-MM");
      const docRef = doc(db, "individualMeals", monthKey);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setExistingDocId(monthKey);
        const data = docSnap.data();
        const dayKey = format(selectedDate, "dd");
        const updatedMealCounts = {};

        members.forEach((member) => {
          const meals = data.mealCounts[member.id] || [];
          const dayEntry = meals.find((entry) => entry.startsWith(dayKey));
          updatedMealCounts[member.id] = dayEntry ? dayEntry.split(" ")[1] : "";
        });

        setMealCounts(updatedMealCounts);
      } else {
        setExistingDocId(null);
        setMealCounts(
          Object.fromEntries(members.map((member) => [member.id, ""]))
        );
      }
    } catch (error) {
      console.error("Error fetching meal counts:", error);
      toast({
        title: "Error",
        description: "Failed to fetch meal count data.",
        variant: "destructive",
      });
    }
  }, [selectedDate, members, setMealCounts, toast]);

  useEffect(() => {
    fetchMembersAndDates();
  }, [fetchMembersAndDates]);

  useEffect(() => {
    if (members.length > 0) fetchMealCounts();
  }, [fetchMealCounts, members]);

  return {
    members,
    datesWithData,
    setDatesWithData,
    existingDocId,
    fetchMembersAndDates,
    fetchMealCounts,
    toast,
  };
};

export default useMealData;