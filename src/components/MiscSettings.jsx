"use client";

import React from 'react';
import { useMiscSettings } from '@/contexts/MiscSettingsContext';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowRightLeft, 
  CreditCard, 
  FileText 
} from 'lucide-react';

export default function MiscSettings() {
  const { settings, updateSetting } = useMiscSettings();

  if (settings.loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Misc Settings</h1>
        <p className="text-gray-600">Manage floating button visibility</p>
      </div>

      <Card className="shadow-sm mt-6">
        <CardHeader>
          <CardTitle className="text-xl">Floating Buttons</CardTitle>
          <CardDescription>
            Show or hide floating action buttons
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {[
            {
              id: 'floatingButtons.carryforward',
              label: 'Carryforward Button',
              description: 'Show the carryforward floating button',
              icon: <ArrowRightLeft className="h-5 w-5 mr-2 text-purple-500" />
            },
            {
              id: 'floatingButtons.due',
              label: 'Due Button',
              description: 'Show the due payments floating button',
              icon: <CreditCard className="h-5 w-5 mr-2 text-blue-500" />
            },
            {
              id: 'floatingButtons.bills',
              label: 'Bills Button',
              description: 'Show the bills floating button',
              icon: <FileText className="h-5 w-5 mr-2 text-green-500" />
            }
          ].map((setting) => (
            <div key={setting.id} className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-full bg-gray-100">
                  {setting.icon}
                </div>
                <div>
                  <Label htmlFor={setting.id} className="text-base font-medium text-gray-900">
                    {setting.label}
                  </Label>
                  <p className="text-sm text-gray-500">
                    {setting.description}
                  </p>
                </div>
              </div>
              <Switch
                id={setting.id}
                checked={setting.id.includes('.') 
                  ? settings[setting.id.split('.')[0]][setting.id.split('.')[1]]
                  : settings[setting.id]
                }
                onCheckedChange={(checked) => updateSetting(setting.id, checked)}
                className="data-[state=checked]:bg-blue-600"
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
