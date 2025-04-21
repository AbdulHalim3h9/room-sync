import { db } from "@/firebase";
import { collection, query, where, getDocs, setDoc, doc } from "firebase/firestore";
import { serverTimestamp } from "firebase/firestore";

export const calculateMonthlyCarryforward = async (month) => {
  // Validate and format month
  if (!month) {
    throw new Error('Month is required');
  }
  
  // Ensure month is in YYYY-MM format
  const monthRegex = /^\d{4}-\d{2}$/;
  if (!monthRegex.test(month)) {
    console.log('Invalid month format:', month);
    throw new Error('Invalid month format. Please use YYYY-MM format');
  }

  console.log('Calculating carryforward for month:', month);

  try {
    // Get meal summaries for the month
    const mealSummariesRef = collection(db, "mealSummaries");
    const monthQuery = query(mealSummariesRef, where("month", "==", month));
    const monthSnapshot = await getDocs(monthQuery);
    
    if (monthSnapshot.empty) {
      console.log('No meal summary found for month:', month);
      return null;
    }

    const mealSummary = monthSnapshot.docs[0].data();
    const { totalMealsAllMembers, totalSpendings, mealRate } = mealSummary;
    console.log('Meal summary:', mealSummary);

    // Get members list
    const membersRef = collection(db, "members");
    const membersSnapshot = await getDocs(membersRef);
    const members = membersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    console.log('Members:', members);

    // Calculate dues and awes for each member
    const memberCalculations = await Promise.all(
      members.map(async (member) => {
        // Get member's meal count for the month from individualMeals
        const individualMealsRef = collection(db, "individualMeals");
        const monthQuery = query(individualMealsRef, 
          where("month", "==", month),
          where("member", "==", member.id)
        );
        const memberMealsSnapshot = await getDocs(monthQuery);
        
        if (memberMealsSnapshot.empty) {
          console.log(`No meal data found for member: ${member.id}`);
          return {
            memberId: member.id,
            dues: 0,
            awes: 0,
            totalMeals: 0
          };
        }

        const memberMeals = memberMealsSnapshot.docs[0].data();
        const { amount: totalMeals } = memberMeals;
        console.log('Member meals:', memberMeals);

        // Calculate member's dues
        const dues = totalMeals * mealRate;
        
        // Calculate awes (if member paid more than dues)
        // For now, we'll set awes to 0 since we don't have payment data
        const awes = 0;

        return {
          memberId: member.id,
          dues,
          awes,
          totalMeals
        };
      })
    );

    // Save carryforward data
    const carryforwardRef = collection(db, "carryForwards");
    const carryforwardDoc = doc(carryforwardRef, month);
    await setDoc(carryforwardDoc, {
      month,
      calculations: memberCalculations,
      totalMealsAllMembers,
      totalSpendings,
      mealRate,
      timestamp: serverTimestamp()
    });

    return memberCalculations;
  } catch (error) {
    console.error("Error calculating carryforward:", error);
    throw error;
  }
  try {
    // Get meal summaries for the month
    const mealSummariesRef = collection(db, "mealSummaries");
    const monthQuery = query(mealSummariesRef, where("month", "==", month));
    const monthSnapshot = await getDocs(monthQuery);
    if (monthSnapshot.empty) {
      throw new Error(`No data found for month: ${month}`);
    }

    const mealSummary = monthSnapshot.docs[0].data();
    const { totalMealsAllMembers, totalSpendings, mealRate } = mealSummary;

    // Get members list
    const membersRef = collection(db, "members");
    const membersSnapshot = await getDocs(membersRef);
    const members = membersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Calculate dues and awes for each member
    const memberCalculations = await Promise.all(
      members.map(async (member) => {
        // Get member's meal count for the month
        const memberMealsRef = collection(db, "members", member.id, "meals");
        const monthQuery = query(memberMealsRef, where("month", "==", month));
        const memberMealsSnapshot = await getDocs(monthQuery);
        
        if (memberMealsSnapshot.empty) {
          console.log(`No meal data found for member: ${member.id}`);
          return {
            memberId: member.id,
            dues: 0,
            awes: 0,
            totalMeals: 0
          };
        }

        const memberMeals = memberMealsSnapshot.docs[0].data();
        const { totalMeals } = memberMeals;

        // Calculate member's dues
        const dues = totalMeals * mealRate;
        
        // Calculate awes (if member paid more than dues)
        // For now, we'll set awes to 0 since we don't have payment data
        const awes = 0;

        return {
          memberId: member.id,
          dues,
          awes,
          totalMeals
        };
      })
    );

    // Save carryforward data
    const carryforwardRef = collection(db, "carryforwards");
    const carryforwardDoc = doc(carryforwardRef, month);
    await setDoc(carryforwardDoc, {
      month,
      calculations: memberCalculations,
      totalMealsAllMembers,
      totalSpendings,
      mealRate,
      timestamp: serverTimestamp()
    });

    return memberCalculations;
  } catch (error) {
    console.error("Error calculating carryforward:", error);
    throw error;
  }
};

export const getCarryforwardData = async (month) => {
  try {
    const carryforwardRef = collection(db, "carryforwards");
    const monthQuery = query(carryforwardRef, where("month", "==", month));
    const snapshot = await getDocs(monthQuery);
    
    if (snapshot.empty) {
      return null;
    }

    return snapshot.docs[0].data();
  } catch (error) {
    console.error("Error getting carryforward data:", error);
    throw error;
  }
};
