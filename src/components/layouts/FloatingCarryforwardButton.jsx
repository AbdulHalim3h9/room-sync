'use client';

import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, X, Share2, Download, Check, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import { cn } from '@/lib/utils';
import { db } from '@/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { format } from 'date-fns';
import CarryforwardSection from "../CarryforwardSection";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

const FloatingCarryforwardButton = () => {
  const [isHighlighted, setIsHighlighted] = useState(false);
  const [animationOffset, setAnimationOffset] = useState({ top: 0, left: 0 });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isVisible, setIsVisible] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const dialogRef = useRef(null);

  const captureAndShare = async (isSharing = false) => {
    console.log('Capture and share triggered, isSharing:', isSharing);
    
    if (!dialogRef.current) {
      console.error('Dialog ref not set');
      alert('Error: Dialog reference not found');
      return;
    }
    
    // Set processing state
    setIsProcessing(true);
    
    try {
      console.log('Starting image capture with html2canvas...');
      
      // Get the element to capture
      const element = dialogRef.current;
      console.log('Element to capture:', element);
      
      if (!element) {
        throw new Error('Element not found for capture');
      }
      
      // Capture the element with html2canvas
      const canvas = await html2canvas(element, {
        scale: 2, // Higher quality
        useCORS: true,
        logging: true,
        backgroundColor: '#ffffff',
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight
      });
      
      // Convert canvas to data URL
      const dataUrl = canvas.toDataURL('image/png', 1.0);
      console.log('Image captured successfully, data URL length:', dataUrl.length);
      
      if (!dataUrl || dataUrl.length < 1000) { // Basic validation
        throw new Error('Captured image data is too small');
      }
      
      if (isSharing && navigator.share) {
        console.log('Sharing image...');
        try {
          // Convert data URL to blob
          canvas.toBlob(async (blob) => {
            try {
              const file = new File([blob], 'carryforward.png', { 
                type: 'image/png',
                lastModified: Date.now()
              });
              
              // Share the file
              await navigator.share({
                title: `Carryforward - ${new Date(currentMonth + "-01").toLocaleString('default', { month: 'long', year: 'numeric' })}`,
                files: [file],
              });
              console.log('Share successful');
            } catch (shareError) {
              console.error('Share error:', shareError);
              // Fallback to download if sharing fails
              downloadImage(dataUrl);
            }
          }, 'image/png');
        } catch (shareError) {
          console.error('Share error, falling back to download:', shareError);
          // Fallback to download if sharing fails
          downloadImage(dataUrl);
        }
      } else {
        console.log('Downloading image...');
        downloadImage(dataUrl);
      }
    } catch (error) {
      console.error('Capture error:', error);
      alert(`Failed to capture image: ${error.message || 'Unknown error'}`);
    } finally {
      // Reset processing state
      setIsProcessing(false);
    }
  };
  
  const downloadImage = (dataUrl) => {
    try {
      console.log('Starting download...');
      
      // Create a temporary link element
      const link = document.createElement('a');
      
      // Generate a filename with the current date
      const dateStr = new Date().toISOString().split('T')[0];
      const fileName = `carryforward-${currentMonth}-${dateStr}.png`;
      
      // Set the download attributes
      link.download = fileName;
      link.href = dataUrl;
      
      // Make the link invisible
      link.style.display = 'none';
      
      // Add to the document, trigger download, and remove
      document.body.appendChild(link);
      console.log('Triggering download click...', { fileName, dataUrl: dataUrl.substring(0, 50) + '...' });
      
      // Use setTimeout to ensure the click is registered
      setTimeout(() => {
        link.click();
        
        // Clean up
        setTimeout(() => {
          document.body.removeChild(link);
          console.log('Download cleanup complete');
          
          // Revoke the object URL to free up memory
          URL.revokeObjectURL(dataUrl);
        }, 100);
      }, 100);
      
      console.log('Download initiated');
      
    } catch (error) {
      console.error('Error in downloadImage:', error);
      alert('Failed to download image. Please try again.');
    }
  };
  
  // State for data needed by CarryforwardSection
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  });
  const [members, setMembers] = useState([]);
  const [carryforwardData, setCarryforwardData] = useState([]);
  const [mealCounts, setMealCounts] = useState({ previous: {} });
  const [mealRate, setMealRate] = useState({ previous: 'N/A' });
  const [totalGroceries, setTotalGroceries] = useState({ previous: 0 });
  const [totalMeals, setTotalMeals] = useState({ previous: 0 });

  // Calculate previous month
  const getPreviousMonth = (month) => {
    const [year, monthNum] = month.split("-").map(Number);
    const date = new Date(year, monthNum - 1, 1);
    date.setMonth(date.getMonth() - 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  };

  const previousMonth = getPreviousMonth(currentMonth);
  
  // Function to fetch active members for the month
  const fetchMembers = async () => {
    try {
      const membersRef = collection(db, "members");
      const querySnapshot = await getDocs(membersRef);
      const allMembers = querySnapshot.docs.map(doc => ({ memberId: doc.id, ...doc.data() }));
      
      // Filter for active members in the previous month
      const previousMonthDate = new Date(previousMonth + "-01");
      const activeMembers = allMembers.filter((member) => {
        if (!member.activeFrom) return false;
        const activeFromDate = new Date(member.activeFrom + "-01");
        if (activeFromDate > previousMonthDate) return false;
        if (member.archiveFrom) {
          const archiveFromDate = new Date(member.archiveFrom + "-01");
          return previousMonthDate < archiveFromDate;
        }
        return true;
      });
      
      setMembers(activeMembers);
    } catch (error) {
      console.error("Error fetching members:", error);
      setError("Failed to load member data.");
    }
  };
  
  // Function to fetch carryforward data
  const fetchCarryforwardData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch members first
      await fetchMembers();
      
      // Fetch carryforward data
      const carryforwardRef = collection(db, "carryforwards");
      const snapshot = await getDocs(query(carryforwardRef, where("month", "==", previousMonth)));
      
      if (!snapshot.empty) {
        const data = snapshot.docs[0].data();
        setCarryforwardData(data.memberDetails || []);
        setMealCounts({ previous: data.mealCounts || {} });
        setMealRate({ previous: data.mealRate || 'N/A' });
        setTotalGroceries({ previous: data.totalGroceries || 0 });
        setTotalMeals({ previous: data.totalMeals || 0 });
      } else {
        // No data found
        setCarryforwardData([]);
        setMealCounts({ previous: {} });
        setMealRate({ previous: 'N/A' });
        setTotalGroceries({ previous: 0 });
        setTotalMeals({ previous: 0 });
      }
    } catch (error) {
      console.error("Error fetching carryforward data:", error);
      setError("Failed to load carryforward data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const generateShareableText = () => {
    let text = `Carryforward Details - ${new Date(currentMonth + "-01").toLocaleString('default', { month: 'long', year: 'numeric' })}\n\n`;
    
    if (carryforwardData.length > 0) {
      text += "Member\t\tMeals\t\tAmount\n";
      text += "-".repeat(40) + "\n";
      
      carryforwardData.forEach(member => {
        text += `${member.name || 'N/A'}\t\t${member.meals || 0}\t\t${member.amount || 0}\n`;
      });
      
      text += "\n";
      text += `Total Meals: ${totalMeals.previous || 0}\n`;
      text += `Meal Rate: ${mealRate.previous === 'N/A' ? 'N/A' : '৳' + mealRate.previous}`;
    } else {
      text += "No carryforward data available for this month.";
    }
    
    return text;
  };

  const handleDownload = () => {
    const text = generateShareableText();
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `carryforward-${currentMonth}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Toggle highlight effect every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIsHighlighted(prev => !prev);
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

  // Fetch carryforward data when dialog opens
  useEffect(() => {
    if (isDialogOpen) {
      fetchCarryforwardData();
    }
  }, [isDialogOpen, previousMonth]);

  if (!isVisible) return null;

  return (
    <>
      <div>
        <button
          onClick={() => setIsDialogOpen(true)}
          className={cn(
            'flex items-center justify-center gap-2',
            'px-3 py-2 rounded-full shadow-lg',
            'hover:scale-105 group transition-all duration-300',
            'text-sm font-medium whitespace-nowrap',
            isHighlighted ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white' : 'bg-white text-blue-600',
            isHighlighted ? 'ring-2 ring-blue-300 shadow-xl' : 'ring-1 ring-gray-200'
          )}
          style={{
            transform: `translate(${animationOffset.left}px, ${animationOffset.top}px)`
          }}
        >
          <TrendingUp className="h-4 w-4" />
          <span>Carryforward</span>
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
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] p-0 overflow-hidden">
          <div className="flex flex-col h-full">
            <div className="p-4 border-b sticky top-0 bg-white z-10">
              <div className="flex justify-between items-center">
                <DialogTitle className="text-xl font-semibold m-0">
                  Carryforward Details - {new Date(currentMonth + "-01").toLocaleString('default', { month: 'long', year: 'numeric' })}
                </DialogTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => captureAndShare(true)}
                    disabled={isProcessing}
                    className="flex items-center gap-1 min-w-[80px]"
                  >
                    {isProcessing ? (
                      <span>Processing...</span>
                    ) : (
                      <>
                        <Share2 className="h-4 w-4" />
                        <span>Share</span>
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => captureAndShare(false)}
                    disabled={isProcessing}
                    className="flex items-center gap-1 min-w-[100px]"
                  >
                    {isProcessing ? (
                      <span>Processing...</span>
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        <span>Download</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
            <div 
              ref={dialogRef}
              className="flex-1 overflow-auto p-6 bg-white"
            >
            {isLoading ? (
              <div className="space-y-6 p-6">
                {/* Announcement skeleton */}
                <div className="space-y-4">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                {/* Table skeleton */}
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            ) : error ? (
              <div className="text-center text-red-500 p-6">
                <p>{error}</p>
                <Button 
                  onClick={fetchCarryforwardData} 
                  className="mt-4 bg-green-500 hover:bg-green-600 text-white"
                >
                  Try Again
                </Button>
              </div>
            ) : (
              <CarryforwardSection
                members={members}
                month={currentMonth}
                carryforwardData={carryforwardData}
                mealCounts={mealCounts}
                mealRate={mealRate}
                totalGroceries={totalGroceries}
                totalMeals={totalMeals}
              />
            )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FloatingCarryforwardButton;
