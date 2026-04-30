'use client';

import { AtSign, MessageCircle, Pin, Reply, Smile } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

/* Backend keys, see NotificationPreference.ts. Kept as a const so adding a
 * new chat-* type is a one-line change here + a one-line change on the model. */
const CHAT_PREF_ROWS = [
  {
    key: 'chatMention',
    icon: AtSign,
    label: 'Mentions',
    description: 'When someone @-mentions you in a project chat',
  },
  {
    key: 'chatReply',
    icon: Reply,
    label: 'Replies to your messages',
    description: 'When someone replies to a message you sent',
  },
  {
    key: 'chatPin',
    icon: Pin,
    label: 'Pinned messages',
    description: 'When someone pins a message you sent',
  },
  {
    key: 'chatMessage',
    icon: MessageCircle,
    label: 'New chat messages',
    description: 'Every new message in your project chats (noisy — off by default)',
  },
  {
    key: 'chatReaction',
    icon: Smile,
    label: 'Reactions',
    description: 'When someone reacts to your message (off by default)',
  },
];

const ACCENT_CLASSES = {
  indigo: { titleIcon: 'text-indigo-600', rowIconBg: 'bg-indigo-50', rowIcon: 'text-indigo-600' },
  blue: { titleIcon: 'text-blue-600', rowIconBg: 'bg-blue-50', rowIcon: 'text-blue-600' },
  purple: { titleIcon: 'text-purple-600', rowIconBg: 'bg-purple-50', rowIcon: 'text-purple-600' },
  emerald: { titleIcon: 'text-emerald-600', rowIconBg: 'bg-emerald-50', rowIcon: 'text-emerald-600' },
  teal: { titleIcon: 'text-teal-600', rowIconBg: 'bg-teal-50', rowIcon: 'text-teal-600' },
};

export default function ChatNotificationPreferences({ preferences = {}, onToggle, accent = 'indigo' }) {
  const a = ACCENT_CLASSES[accent] || ACCENT_CLASSES.indigo;

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <MessageCircle className={`w-5 h-5 ${a.titleIcon}`} />
          Chat Notifications
        </CardTitle>
      </CardHeader>
      <CardContent className="divide-y divide-gray-100">
        {CHAT_PREF_ROWS.map(({ key, icon: Icon, label, description }) => (
          <div key={key} className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3 flex-1 min-w-0 mr-4">
              <div className={`w-8 h-8 rounded-lg ${a.rowIconBg} flex items-center justify-center shrink-0`}>
                <Icon className={`w-4 h-4 ${a.rowIcon}`} />
              </div>
              <div>
                <Label htmlFor={`chat-pref-${key}`} className="text-sm font-medium text-gray-900 cursor-pointer">
                  {label}
                </Label>
                <p className="text-xs text-gray-500 mt-0.5">{description}</p>
              </div>
            </div>
            <Switch
              id={`chat-pref-${key}`}
              checked={!!preferences[key]}
              onCheckedChange={() => onToggle(key)}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
