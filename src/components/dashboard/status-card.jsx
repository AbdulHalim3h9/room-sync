import React from 'react';
import { cn } from '@/lib/utils';

const StatusCard = ({ dueMembers = [], mealRate, className }) => {
  return (
    <div className="w-full">
      {/* Meal Rate Floating Pill */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-1.5">
          
        </div>

        {/* Meal Rate Indicator */}
        <div className={`px-3 py-1.5 rounded-full flex items-center ${dueMembers.length > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path>
              <path d="M3 6h18"></path>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
            <span className="font-medium text-sm whitespace-nowrap">Meal Rate: {mealRate === "N/A" ? "N/A" : `${mealRate} tk`}</span>
          </div>
      </div>

      {/* Due Members Horizontal Scroll */}
      {dueMembers.length > 0 && (
        <div className="relative w-full">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-full bg-gradient-to-r from-background to-transparent z-10"></div>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-full bg-gradient-to-l from-background to-transparent z-10"></div>
          
          <div className="overflow-x-auto pb-1 hide-scrollbar relative">
            <div className="flex gap-2 px-4">
              <div className="flex-shrink-0 bg-red-50 border border-red-200 rounded-lg px-3 py-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500 mr-2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <span className="text-sm font-medium text-red-700 whitespace-nowrap">Add Money:</span>
              </div>
              
              {dueMembers.map((item) => (
                <div 
                  key={item.name}
                  className="flex-shrink-0 bg-white border border-red-200 rounded-lg px-3 py-2 flex items-center gap-1.5 hover:bg-red-50 transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center text-red-700 text-xs font-bold">
                    {item.name.charAt(0)}
                  </div>
                  <span className="text-sm font-medium text-gray-700 whitespace-nowrap">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add custom styles to hide scrollbar but keep functionality */}
      <style jsx global>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default StatusCard;