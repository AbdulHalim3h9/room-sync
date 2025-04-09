import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const StatusCard = ({ dueMembers = [], mealRate, className }) => {
  return (
    <Card className={cn("shadow-lg border-l-4 border-primary/30 bg-gradient-to-br from-background to-muted/50", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path>
                <path d="M12 8v4"></path>
                <path d="M12 16h.01"></path>
              </svg>
            </div>
            <div>
              <CardTitle className="text-sm font-medium bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">Status Overview</CardTitle>
              <p className="text-xs text-muted-foreground">Current month summary</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path>
                <path d="M3 6h18"></path>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">Meal Rate</p>
              <p className="text-xs text-muted-foreground">{mealRate === "N/A" ? "N/A" : `${mealRate} tk/meal`}</p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        {dueMembers.length > 0 ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-gradient-to-br from-red-500/20 to-red-500/10 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              </div>
              <p className="text-sm bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">{dueMembers.length} pending contributions</p>
            </div>
            <div className="flex flex-wrap gap-1">
              {dueMembers.map((item) => (
                <span 
                  key={item.name}
                  className="px-2 py-1 bg-gradient-to-br from-red-500/10 to-red-500/5 text-red-500 rounded-full text-xs font-medium border border-red-500/20 hover:border-red-500/40 transition-colors"
                >
                  {item.name}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="p-1 bg-gradient-to-br from-green-500/20 to-green-500/10 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <p className="text-sm bg-gradient-to-r from-green-500 to-green-600 bg-clip-text text-transparent">All contributions are up to date</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StatusCard; 