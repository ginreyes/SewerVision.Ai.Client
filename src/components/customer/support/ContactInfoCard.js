'use client';

import {
  HelpCircle,
  Mail,
  Phone,
  Clock,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ContactInfoCard = () => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Need Help?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="flex items-start gap-2">
            <Mail className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <div>
              <p className="font-medium">Email Support</p>
              <p className="text-muted-foreground">support@yourcompany.com</p>
              <p className="text-xs text-muted-foreground">Response within 24h</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Phone className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <div>
              <p className="font-medium">Phone Support</p>
              <p className="text-muted-foreground">+961 1 123 456</p>
              <p className="text-xs text-muted-foreground">Mon-Fri, 9AM-5PM EET</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Clock className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <div>
              <p className="font-medium">Live Chat</p>
              <p className="text-muted-foreground">Available soon</p>
              <p className="text-xs text-muted-foreground">Coming Q1 2026</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Common Issues</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-start gap-2">
            <CheckCircle className="h-3.5 w-3.5 mt-0.5 text-green-500" />
            <span>How to download a report</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-3.5 w-3.5 mt-0.5 text-green-500" />
            <span>Understanding AI defect severity</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-3.5 w-3.5 mt-0.5 text-green-500" />
            <span>Updating project location</span>
          </div>
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-3.5 w-3.5 mt-0.5 text-yellow-500" />
            <span>Report not appearing in dashboard</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContactInfoCard;
