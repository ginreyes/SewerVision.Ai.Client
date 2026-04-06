'use client';
import ErrorBoundaryUI from '@/components/shared/ErrorBoundaryUI';
export default function Error({ error, reset }) {
  return <ErrorBoundaryUI error={error} reset={reset} rolePath="/customer/dashboard" />;
}
