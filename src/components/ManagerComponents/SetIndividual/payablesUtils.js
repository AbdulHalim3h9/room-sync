import { db } from "@/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export const validateForm = (individuals) => {
  const errors = [];
  individuals.forEach((individual, index) => {
    if (!individual.member) {
      errors.push(`Member for Individual ${index + 1}`);
    }
    individual.fields.forEach((field, fieldIndex) => {
      if (!field.title) {
        errors.push(`Title for field ${fieldIndex + 1} of Individual ${index + 1}`);
      }
      if (!field.amount) {
        errors.push(`Amount for field ${fieldIndex + 1} of Individual ${index + 1}`);
      } else if (!/^\d+$/.test(field.amount) || parseInt(field.amount) <= 0) {
        errors.push(
          `Amount for field ${fieldIndex + 1} of Individual ${index + 1} must be a positive integer`
        );
      }
    });
  });
  return errors;
};

export const handleSubmit = async (selectedMonth, individuals, activeMembers, setIndividuals, toast, setIsLoading) => {
  const validationErrors = validateForm(individuals);
  if (validationErrors.length > 0) {
    toast({
      title: "Validation Error",
      description: validationErrors.join(", "),
      variant: "destructive",
      className: "z-[1002]",
    });
    return;
  }

  setIsLoading(true);
  try {
    const docRef = doc(db, "payables", selectedMonth);
    const docSnap = await getDoc(docRef);
    let existingBills = docSnap.exists() ? docSnap.data().bills || [] : [];

    if (!Array.isArray(existingBills)) {
      existingBills = [];
    }

    const newIndividualBills = individuals.map((individual) => {
      const selectedMember = activeMembers.find(
        (member) => member.name === individual.member
      );
      return {
        id: selectedMember?.id || "",
        name: individual.member,
        status: "Pending",
        payables: individual.fields.map((field) => ({
          name: field.title,
          amount: parseInt(field.amount) || 0,
        })),
      };
    });

    const updatedBills = activeMembers.map((member) => {
      const newBill = newIndividualBills.find((bill) => bill.id === member.id);
      const existingBill = existingBills.find((bill) => bill.id === member.id);
      if (newBill) {
        return {
          ...existingBill,
          ...newBill,
          payables: [
            ...(existingBill?.payables || []),
            ...newBill.payables,
          ],
        };
      }
      return existingBill || {
        id: member.id,
        name: member.name,
        status: "Pending",
        payables: [],
      };
    });

    await setDoc(docRef, { 
      bills: updatedBills,
      lastUpdated: new Date().toISOString(),
    }, { merge: true });

    toast({
      title: "Success",
      description: `Individual payables for ${selectedMonth} have been set.`,
      className: "z-[1002]",
    });

    setIndividuals([{ member: "", fields: [{ title: "", amount: "" }] }]);
  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to set individual payables. Please try again.",
      variant: "destructive",
      className: "z-[1002]",
    });
  } finally {
    setIsLoading(false);
  }
};