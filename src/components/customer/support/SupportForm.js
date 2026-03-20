'use client';

import { MessageCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const SupportForm = ({
  subject,
  onSubjectChange,
  category,
  onCategoryChange,
  message,
  onMessageChange,
  isSubmitting,
  isSubmitted,
  onSubmit,
  onReset,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Contact Support
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Describe your issue and we'll get back to you soon.
        </p>
      </CardHeader>
      <CardContent>
        {isSubmitted ? (
          <div className="text-center py-8">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
            <h3 className="text-lg font-semibold mt-3">Message Sent!</h3>
            <p className="text-muted-foreground mt-1">
              We've received your request and will respond within 24 hours.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={onReset}
            >
              Send Another Message
            </Button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => onSubjectChange(e.target.value)}
                  placeholder="e.g., Report not loading"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={onCategoryChange} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="report">Report Issue</SelectItem>
                    <SelectItem value="project">Project Setup</SelectItem>
                    <SelectItem value="account">Account/Login</SelectItem>
                    <SelectItem value="billing">Billing</SelectItem>
                    <SelectItem value="feature">Feature Request</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => onMessageChange(e.target.value)}
                placeholder="Please describe your issue in detail..."
                rows={6}
                required
              />
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto" variant="rose">
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
};

export default SupportForm;
