'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/helper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Monitor, FolderOpen, Link2 } from 'lucide-react';
import { useAlert } from '@/components/providers/AlertProvider';

export default function UserDeviceAssignmentsPage() {
  const { showAlert } = useAlert();
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        setLoading(true);
        const { ok, data } = await api('/api/devices/get-all-devices', 'GET');
        const list = data?.data ?? (Array.isArray(data) ? data : []);
        if (!ok) {
          setDevices([]);
          return;
        }
        setDevices(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error('Failed to load devices:', err);
        showAlert('Failed to load devices', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();
  }, [showAlert]);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white shadow-lg">
          <Monitor className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Device Assignments</h1>
          <p className="text-sm text-gray-600">
            View devices and which projects or operators they are currently linked to.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">
            Assignment management will let you map cameras and trucks to specific projects
            and operators. Admin defines roles and members; management users control how
            those members are assigned in the field.
          </CardTitle>
        </CardHeader>
      </Card>

      {loading ? (
        <Card>
          <CardContent className="py-10 text-center text-gray-500">
            Loading devices...
          </CardContent>
        </Card>
      ) : devices.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-gray-500">
            No devices found yet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {devices.map((d) => (
            <Card key={d._id}>
              <CardContent className="pt-4 pb-5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-indigo-500" />
                    <p className="font-semibold text-gray-900">
                      {d.name || d.deviceName || 'Unnamed Device'}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {d.status || 'Unknown'}
                  </Badge>
                </div>
                <p className="text-xs text-gray-600">
                  Serial: {d.serialNumber || 'N/A'}
                </p>
                {d.assignedProject && (
                  <p className="text-xs text-gray-700 flex items-center gap-1">
                    <FolderOpen className="w-3 h-3" />
                    Project: {d.assignedProject.name || 'N/A'}
                  </p>
                )}
                {(d.teamLeader || d.operator) && (
                  <p className="text-xs text-gray-700 flex items-center gap-1">
                    <Link2 className="w-3 h-3" />
                    Team Leader: {d.teamLeader?.first_name || d.teamLeader?.last_name
                      ? `${d.teamLeader.first_name || ''} ${d.teamLeader.last_name || ''}`.trim()
                      : d.teamLeader?.username || d.assignedTo?.username || d.operator?.username || 'N/A'}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

