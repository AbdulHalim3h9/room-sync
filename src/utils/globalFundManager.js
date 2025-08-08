import { db } from "@/firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

/**
 * Global Fund Manager - Handles month-independent fund tracking
 * This ensures that fund balances carry forward between months
 */

// Global fund document ID (month-independent)
const GLOBAL_FUND_DOC_ID = "global_fund";

/**
 * Get the current global fund balance
 * @returns {Promise<Object>} Global fund data
 */
export const getGlobalFund = async () => {
  try {
    const globalFundRef = doc(db, "globalFund", GLOBAL_FUND_DOC_ID);
    const globalFundSnap = await getDoc(globalFundRef);
    
    if (globalFundSnap.exists()) {
      return globalFundSnap.data();
    } else {
      // Initialize global fund if it doesn't exist
      const initialData = {
        totalMealFund: 0,
        totalSpendings: 0,
        lastUpdated: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };
      await setDoc(globalFundRef, initialData);
      return initialData;
    }
  } catch (error) {
    console.error("Error getting global fund:", error);
    throw error;
  }
};

/**
 * Update the global meal fund (add money)
 * @param {number} amount - Amount to add
 * @returns {Promise<void>}
 */
export const addToGlobalMealFund = async (amount) => {
  try {
    const globalFundRef = doc(db, "globalFund", GLOBAL_FUND_DOC_ID);
    const globalFundSnap = await getDoc(globalFundRef);
    
    let currentData = { totalMealFund: 0, totalSpendings: 0 };
    if (globalFundSnap.exists()) {
      currentData = globalFundSnap.data();
    }
    
    const newTotalMealFund = currentData.totalMealFund + amount;
    
    await setDoc(globalFundRef, {
      ...currentData,
      totalMealFund: newTotalMealFund,
      lastUpdated: new Date().toISOString(),
    }, { merge: true });
    
    console.log(`Added ${amount} to global meal fund. New total: ${newTotalMealFund}`);
  } catch (error) {
    console.error("Error adding to global meal fund:", error);
    throw error;
  }
};

/**
 * Deduct from global meal fund (spend money)
 * @param {number} amount - Amount to deduct
 * @returns {Promise<boolean>} True if successful, false if insufficient funds
 */
export const deductFromGlobalMealFund = async (amount) => {
  try {
    const globalFundRef = doc(db, "globalFund", GLOBAL_FUND_DOC_ID);
    const globalFundSnap = await getDoc(globalFundRef);
    
    let currentData = { totalMealFund: 0, totalSpendings: 0 };
    if (globalFundSnap.exists()) {
      currentData = globalFundSnap.data();
    }
    
    if (currentData.totalMealFund < amount) {
      console.warn(`Insufficient funds. Available: ${currentData.totalMealFund}, Required: ${amount}`);
      return false;
    }
    
    const newTotalMealFund = currentData.totalMealFund - amount;
    const newTotalSpendings = currentData.totalSpendings + amount;
    
    await setDoc(globalFundRef, {
      ...currentData,
      totalMealFund: newTotalMealFund,
      totalSpendings: newTotalSpendings,
      lastUpdated: new Date().toISOString(),
    }, { merge: true });
    
    console.log(`Deducted ${amount} from global meal fund. New total: ${newTotalMealFund}`);
    return true;
  } catch (error) {
    console.error("Error deducting from global meal fund:", error);
    throw error;
  }
};

/**
 * Add to global spendings (for tracking purposes)
 * @param {number} amount - Amount to add to spendings
 * @returns {Promise<void>}
 */
export const addToGlobalSpendings = async (amount) => {
  try {
    const globalFundRef = doc(db, "globalFund", GLOBAL_FUND_DOC_ID);
    const globalFundSnap = await getDoc(globalFundRef);
    
    let currentData = { totalMealFund: 0, totalSpendings: 0 };
    if (globalFundSnap.exists()) {
      currentData = globalFundSnap.data();
    }
    
    const newTotalSpendings = currentData.totalSpendings + amount;
    
    await setDoc(globalFundRef, {
      ...currentData,
      totalSpendings: newTotalSpendings,
      lastUpdated: new Date().toISOString(),
    }, { merge: true });
    
    console.log(`Added ${amount} to global spendings. New total: ${newTotalSpendings}`);
  } catch (error) {
    console.error("Error adding to global spendings:", error);
    throw error;
  }
};

/**
 * Calculate global meal rate based on cumulative data
 * @param {number} totalMeals - Total meals for calculation
 * @returns {Promise<number>} Meal rate
 */
export const calculateGlobalMealRate = async (totalMeals) => {
  try {
    const globalFund = await getGlobalFund();
    
    if (totalMeals > 0 && globalFund.totalSpendings > 0) {
      return (globalFund.totalSpendings / totalMeals).toFixed(2);
    }
    
    return 0;
  } catch (error) {
    console.error("Error calculating global meal rate:", error);
    return 0;
  }
};

/**
 * Get remaining fund balance
 * @returns {Promise<number>} Remaining fund
 */
export const getRemainingFund = async () => {
  try {
    const globalFund = await getGlobalFund();
    return Math.max(0, globalFund.totalMealFund - globalFund.totalSpendings);
  } catch (error) {
    console.error("Error getting remaining fund:", error);
    return 0;
  }
};

/**
 * Initialize global fund if it doesn't exist
 * @returns {Promise<void>}
 */
export const initializeGlobalFund = async () => {
  try {
    const globalFundRef = doc(db, "globalFund", GLOBAL_FUND_DOC_ID);
    const globalFundSnap = await getDoc(globalFundRef);
    
    if (!globalFundSnap.exists()) {
      await setDoc(globalFundRef, {
        totalMealFund: 0,
        totalSpendings: 0,
        lastUpdated: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      });
      console.log("Global fund initialized");
    }
  } catch (error) {
    console.error("Error initializing global fund:", error);
    throw error;
  }
};
