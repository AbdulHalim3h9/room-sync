import { db } from "@/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { format } from "date-fns";

/**
 * Validates the meal count submission before processing
 * @param {Date} selectedDate - The date for which meal counts are being submitted
 * @param {Object} mealCounts - Object containing meal counts for each member
 * @param {Function} toast - Toast notification function to show validation messages
 * @returns {Promise<boolean>} Returns true if validation passes, false otherwise
 */
export const validateSubmission = async (selectedDate, mealCounts, toast) => {
  if (!Object.values(mealCounts).every((count) => count !== "" && count !== null)) {
    toast({
      title: "Validation Error",
      description: "All meal count fields must be filled out!",
      variant: "destructive",
    });
    return false;
  }

  const month = format(selectedDate, "yyyy-MM");
  let startDay = 1;

  try {
    const docRef = doc(db, "individualMeals", month);
    const docSnap = await getDoc(docRef);
    const existingData = docSnap.exists() ? docSnap.data() : { mealCounts: {} };

    for (const [memberId] of Object.entries(mealCounts)) {
      const meals = existingData.mealCounts[memberId] || [];
      const secondLastMeal = meals.length > 1 ? meals[meals.length - 2] : "";
      startDay = meals.length === 0 ? 0 : parseInt(secondLastMeal.slice(0, 2));
    }
  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to validate submission. Please try again.",
      variant: "destructive",
    });
    return false;
  }

  if (selectedDate.getDate() - startDay !== 1 && selectedDate.getDate() > startDay) {
    toast({
      title: "Validation Error",
      description: `Please fill out the meal count for date ${startDay + 1} first`,
      variant: "destructive",
    });
    return false;
  }

  return true;
};

/**
 * Saves meal summaries and calculates consumption for each member
 * @param {string} month - Month in 'yyyy-MM' format
 * @param {Object} mealCountsData - Object containing meal count data for all members
 * @param {Array} members - List of member objects
 * @param {Function} toast - Toast notification function for user feedback
 * @param {boolean} isUpdate - Indicates if this is an update to existing data
 * @param {Object} oldMealTotals - Previous meal totals for updates
 */
const saveSummariesAndConsumption = async (month, mealCountsData, members, toast, isUpdate = false, oldMealTotals = {}) => {
  try {
    const memberTotals = {};
    let totalMealsAllMembers = 0;
    let hasMealEntries = false;

    for (const [memberId, meals] of Object.entries(mealCountsData)) {
      if (!Array.isArray(meals)) continue;
      
      const totalIndex = meals.findIndex((meal) => meal && meal.startsWith("Total"));
      const prevEntry = meals[totalIndex - 1];
      const prevEntryNumber = prevEntry ? parseInt(prevEntry.split(" ")[1]) || 0 : 0;
      
      hasMealEntries = true;
      const totalEntry = meals.find((meal) => meal && meal.startsWith("Total"));
      if (totalEntry) {
        const total = parseInt(totalEntry.split(" ")[1]) || 0;
        memberTotals[memberId] = prevEntryNumber;
        totalMealsAllMembers += prevEntryNumber;
      }
    }

    if (!hasMealEntries) {
      return;
    }

    const summaryRef = doc(db, "mealSummaries", month);
    const summarySnap = await getDoc(summaryRef);
    const existingData = summarySnap.exists() ? summarySnap.data() : {};
    
    let existingTotalMeals = existingData.totalMealsAllMembers || 0;
    const existingTotalSpendings = existingData.totalSpendings || 0;

    if (isUpdate && Object.keys(oldMealTotals).length > 0) {
      const oldTotal = Object.values(oldMealTotals).reduce((sum, count) => sum + count, 0);
      existingTotalMeals = Math.max(0, existingTotalMeals - oldTotal);
    }

    if (existingTotalSpendings === 0) {
      toast({
        title: "Warning",
        description: "No spending data available for this month. Consumption will be set to 0.",
        variant: "destructive",
      });
    }

    const updatedTotalMeals = existingTotalMeals + totalMealsAllMembers;
    const mealRate =
      existingTotalSpendings > 0 && updatedTotalMeals > 0
        ? (existingTotalSpendings / updatedTotalMeals).toFixed(2)
        : 0;

    const summaryData = {
      totalMealsAllMembers: updatedTotalMeals,
      totalSpendings: existingTotalSpendings,
      mealRate: parseFloat(mealRate),
      lastUpdated: new Date().toISOString(),
    };
    
    await setDoc(summaryRef, summaryData, { merge: true });

    for (const member of members) {
      const memberId = member.id;
      const memberName = member.name;
      const totalMeals = memberTotals[memberId] || 0;
      const consumption = totalMeals * parseFloat(mealRate);

      const contribConsumpDocId = `${month}-${memberName}`;
      const contribConsumpRef = doc(db, "contributionConsumption", contribConsumpDocId);
      const contribConsumpSnap = await getDoc(contribConsumpRef);
      const existingContribData = contribConsumpSnap.exists() ? contribConsumpSnap.data() : {};

      const contribData = {
        member: memberName,
        month,
        contribution: existingContribData.contribution || 0,
        consumption: consumption || 0,
        lastUpdated: new Date().toISOString(),
      };
      
      await setDoc(contribConsumpRef, contribData, { merge: true });
    }
  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to save meal summaries or consumption.",
      variant: "destructive",
    });
  }
};

/**
 * Handles the confirmation and submission of meal counts
 * @param {Object} mealCounts - Object containing date and meal counts for members
 * @param {Array} members - List of member objects
 * @param {Array} datesWithData - Array of dates that already have meal data
 * @param {Function} setDatesWithData - State setter for updating dates with data
 * @param {Function} setIsModalOpen - State setter for modal visibility
 * @param {Function} toast - Toast notification function for user feedback
 */
export const handleConfirmSubmit = async (mealCounts, members, datesWithData, setDatesWithData, setIsModalOpen, toast) => {
  setIsModalOpen(false);
  const month = mealCounts.date.slice(0, 7);
  const day = mealCounts.date.slice(-2);
  let oldMealTotals = {};

  try {
    const docRef = doc(db, "individualMeals", month);
    const docSnap = await getDoc(docRef);
    let existingData = docSnap.exists() ? docSnap.data() : { mealCounts: {} };

    const isUpdate = Object.entries(existingData.mealCounts).some(([_, meals]) => 
      Array.isArray(meals) && meals.some(entry => entry.startsWith(day))
    );

    if (isUpdate) {
      Object.entries(existingData.mealCounts).forEach(([memberId, meals]) => {
        const dayEntry = Array.isArray(meals) ? meals.find(entry => entry.startsWith(day)) : null;
        if (dayEntry) {
          oldMealTotals[memberId] = parseInt(dayEntry.split(' ')[1]) || 0;
        }
      });
    }

    const { date, ...mealData } = mealCounts;

    const allZeros = Object.values(mealData).every(count => count === '0' || count === 0 || count === '');
    if (allZeros) {
      toast({
        title: "Warning",
        description: "All meal counts are zero. No data will be saved.",
        variant: "destructive",
      });
      return;
    }

    for (const [memberId, mealCount] of Object.entries(mealData)) {
      let meals = Array.isArray(existingData.mealCounts[memberId]) ? 
                [...existingData.mealCounts[memberId]] : [];
      
      meals = meals.filter(
        (entry) => !entry.startsWith(day) && !entry.startsWith("Total")
      );
      
      meals.push(`${day} ${parseInt(mealCount, 10)}`);

      const newSum = meals.reduce((sum, entry) => {
        const [, count] = entry.split(" ");
        return sum + (parseInt(count, 10) || 0);
      }, 0);

      meals.push(`Total ${newSum}`);
      existingData.mealCounts[memberId] = meals;
    }

    await setDoc(docRef, existingData, { merge: true });
    await saveSummariesAndConsumption(
      month, 
      existingData.mealCounts, 
      members, 
      toast, 
      isUpdate, 
      oldMealTotals
    );

    const newDate = new Date(mealCounts.date);
    if (!datesWithData.some((d) => d.getTime() === newDate.getTime())) {
      setDatesWithData((prev) => [...prev, newDate]);
    }

    toast({
      title: "Success!",
      description: "Meal counts submitted successfully!",
      variant: "success",
    });
  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to submit meal counts. Please try again.",
      variant: "destructive",
    });
  }
};