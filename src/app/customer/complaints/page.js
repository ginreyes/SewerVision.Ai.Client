'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ComplaintsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/customer/support');
  }, [router]);
  return null;
}
