import { useEffect, useState } from "react";
import { db } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";

export function FundIndicator() {
  const [totalMealFund, setTotalMealFund] = useState(0);
  const [totalSpendings, setTotalSpendings] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFundData = async () => {
      try {
        const today = new Date();
        const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
        const mealSummaryRef = doc(db, "mealSummaries", currentMonth);
        const mealSummarySnap = await getDoc(mealSummaryRef);
        
        if (mealSummarySnap.exists()) {
          const data = mealSummarySnap.data();
          setTotalMealFund(parseFloat(data.totalMealFund || 0));
          setTotalSpendings(parseFloat(data.totalSpendings || 0));
        }
      } catch (error) {
        console.error("Error fetching fund data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFundData();
  }, []);

  const remainingFund = totalMealFund - totalSpendings;
  const remainingPercentage = totalMealFund > 0 ? Math.round((remainingFund / totalMealFund) * 100) : 0;
  
  const getProgressBarColor = () => {
    if (remainingPercentage < 20) return 'bg-red-500';
    if (remainingPercentage < 40) return 'bg-yellow-500';
    return 'bg-green-500';
  };
  
  const progressBarColor = getProgressBarColor();

  if (loading) {
    return (
      <div className="p-4 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-2 w-full" />
      </div>
    );
  }

  return (
    <div className="px-4 py-3 border-t border-gray-200 bg-white">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-medium text-gray-500">Available Funds</span>
        <span className="text-xs font-medium text-gray-900">
          ৳{remainingFund.toLocaleString()} / ৳{totalMealFund.toLocaleString()}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-500 ${progressBarColor}`}
          style={{ width: `${Math.min(remainingPercentage, 100)}%` }}
        />
      </div>
      <div className="flex justify-between mt-1.5">
        <span className="text-xs text-gray-600">
          Spent: ৳{totalSpendings.toLocaleString()}
        </span>
        <span className="text-xs font-medium text-gray-900">
          {remainingPercentage}% remaining
        </span>
      </div>
    </div>
  );
}
