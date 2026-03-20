"use client";
import {
  Tabs,
  TabsContent,
  TabsListAlt,
  TabsTriggerAlt,
} from "@/components/ui/tabs";
import React from "react";
import { FaUser, FaLock, FaBell, FaCreditCard } from "react-icons/fa";
import {
  AccountSettings,
  SecuritySettings,
  Notifications,
} from "@/components/admin/profile";

const Settings = () => {
  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex pb-6">
        <h1 className="font-bold text-3xl md:text-5xl">Account Settings</h1>
      </div>

      <div className="flex flex-col items-center gap-4">
        <Tabs defaultValue="account" className="w-full pb-4">
          <TabsListAlt className="flex justify-center gap-4 w-full ">
            <TabsTriggerAlt
              className="w-1/4 flex items-center gap-2"
              value="account"
            >
              <FaUser className="text-lg" />
              Account
            </TabsTriggerAlt>
            <TabsTriggerAlt
              className="w-1/4 flex items-center gap-2"
              value="security"
            >
              <FaLock className="text-lg" />
              Security
            </TabsTriggerAlt>
            <TabsTriggerAlt
              className="w-1/4 flex items-center gap-2"
              value="notifications"
            >
              <FaBell className="text-lg" />
              Notifications
            </TabsTriggerAlt>
            <TabsTriggerAlt
              className="w-1/4 flex items-center gap-2"
              value="billing"
            >
              <FaCreditCard className="text-lg" />
              Billing
            </TabsTriggerAlt>
          </TabsListAlt>

          <div className="pt-4">
            <TabsContent value="account">
              <AccountSettings />
            </TabsContent>

            <TabsContent value="security">
              <SecuritySettings />
            </TabsContent>

            <TabsContent value ='notifications'>
              <Notifications />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;
