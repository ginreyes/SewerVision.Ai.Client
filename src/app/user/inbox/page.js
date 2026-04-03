'use client';
import { redirect } from 'next/navigation';
export default function InboxRedirect() {
  redirect('/user/notifications');
}
