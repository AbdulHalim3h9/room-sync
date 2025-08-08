import { db } from "@/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { addToGlobalMealFund } from "@/utils/globalFundManager";

export const validateForm = (selectedDonor, amount, toast) => {
  const errors = [];

  if (!selectedDonor) {
    errors.push("Donor Name");
  }
  if (!amount) {
    errors.push("Amount");
  } else if (!/^\d+$/.test(amount)) {
    errors.push("Amount must be a number");
  }

  if (errors.length > 0) {
    toast({
      title: "Validation Error",
      description: errors.join(", ") + " is required.",
      variant: "destructive",
      className: "z-[1002]",
    });
    return false;
  }
  return true;
};

export const saveMealFund = async (selectedMonth, donor, newAmount, isFirstEntry, previousMonthDues, members, toast) => {
  try {
    let adjustedAmount = newAmount;
    if (isFirstEntry && previousMonthDues !== null) {
      adjustedAmount = newAmount + previousMonthDues;
      
      const confirm = window.confirm(
        `This is the first meal fund entry for ${donor} in ${selectedMonth}.\n` +
        `Previous month's balance: ${previousMonthDues.toFixed(2)} BDT\n` +
        `Original amount: ${newAmount.toFixed(2)} BDT\n` +
        `Adjusted amount: ${adjustedAmount.toFixed(2)} BDT\n\n` +
        `Proceed with adjusted amount?`
      );
      
      if (!confirm) {
        return;
      }
    }

    const donorMember = members.find((m) => m.member_name === donor);
    if (!donorMember) {
      throw new Error("Selected donor not found.");
    }
    const activeFromDate = new Date(donorMember.activeFrom + "-01");
    const selectedMonthDate = new Date(selectedMonth + "-01");
    if (activeFromDate > selectedMonthDate) {
      throw new Error("Selected donor is not active for this month.");
    }
    if (donorMember.archiveFrom) {
      const archiveFromDate = new Date(donorMember.archiveFrom + "-01");
      if (selectedMonthDate >= archiveFromDate) {
        throw new Error("Selected donor is not active for this month.");
      }
    }

    const mealFundsDocId = `${selectedMonth}-${donor}`;
    const mealFundsRef = doc(db, "meal_funds", mealFundsDocId);
    const mealFundsSnap = await getDoc(mealFundsRef);
    const existingAmount = mealFundsSnap.exists() ? mealFundsSnap.data().amount || 0 : 0;
    const updatedAmount = isFirstEntry ? adjustedAmount : existingAmount + newAmount;

    await setDoc(
      mealFundsRef,
      {
        donor,
        amount: updatedAmount,
        month: selectedMonth,
        timestamp: new Date().toISOString(),
      },
      { merge: true }
    );

    // Add to global meal fund (month-independent)
    const amountToAdd = isFirstEntry ? adjustedAmount : newAmount;
    await addToGlobalMealFund(amountToAdd);

    const contribConsumpDocId = `${selectedMonth}-${donor}`;
    const contribConsumpRef = doc(db, "contributionConsumption", contribConsumpDocId);
    const contribConsumpSnap = await getDoc(contribConsumpRef);
    const existingContribData = contribConsumpSnap.exists() ? contribConsumpSnap.data() : {};

    await setDoc(
      contribConsumpRef,
      {
        member: donor,
        month: selectedMonth,
        contribution: updatedAmount,
        consumption: existingContribData.consumption || 0,
        lastUpdated: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    toast({
      title: "Error",
      description: error.message || "Failed to save meal fund or contribution.",
      variant: "destructive",
      className: "z-[1002]",
    });
    throw error;
  }
};