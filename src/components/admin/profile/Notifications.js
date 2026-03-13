"use client";
import { Card, CardContent } from "@/components/ui/card";
import React, { useState } from "react";

const Notifications = () => {
    const [emailNotifications, setEmailNotifications] = useState(true);

    return (
        <Card className='p-7'>
            <CardContent>
                <h2 className="text-lg font-semibold">Notifications</h2>
                <p>Manage your notification settings here.</p>
            </CardContent>
        </Card>
    )
};

export default Notifications;
