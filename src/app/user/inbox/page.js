'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Inbox, Bell } from 'lucide-react';

export default function UserInboxPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white shadow-lg">
          <Inbox className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inbox</h1>
          <p className="text-sm text-gray-600">
            Central place for task updates, project changes, and QC/operator notifications.
          </p>
        </div>
      </div>

      <Card className="border-dashed border-2 border-gray-200 bg-gray-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm text-gray-800">
            <Bell className="w-4 h-4 text-rose-500" />
            Coming soon
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-600 space-y-2">
          <p>
            This inbox will surface cross-team activity: task assignments, device changes,
            and important alerts from your Operator and QC teams.
          </p>
          <p className="text-xs text-gray-500">
            For now, you can still see notifications in each role&apos;s dashboard.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

