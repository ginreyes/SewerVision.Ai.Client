'use client';

import { useState } from 'react';
import { useUser } from '@/components/providers/UserContext';
import { useAlert } from '@/components/providers/AlertProvider';
import { useSubmitCustomerSupportTicket } from '@/hooks/useQueryHooks';

import ContactInfoCard from '@/components/customer/support/ContactInfoCard';
import SupportForm from '@/components/customer/support/SupportForm';

const SupportPageCustomer = () => {
  const { userId } = useUser();
  const { showAlert } = useAlert();

  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const submitTicketMutation = useSubmitCustomerSupportTicket();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await submitTicketMutation.mutateAsync({
        userId,
        subject,
        category,
        message,
      });
      setIsSubmitted(true);
      setSubject('');
      setCategory('');
      setMessage('');
      showAlert('Support ticket submitted successfully', 'success');
    } catch (err) {
      console.error('Error submitting ticket:', err);
      showAlert(err.message || 'Failed to submit support ticket', 'error');
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6" data-tour="customer-support">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Support</h1>
        <p className="text-muted-foreground">
          Get help with your projects, reports, or account
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Contact Options */}
        <div className="md:col-span-1">
          <ContactInfoCard />
        </div>

        {/* Support Form */}
        <div className="md:col-span-2">
          <SupportForm
            subject={subject}
            onSubjectChange={setSubject}
            category={category}
            onCategoryChange={setCategory}
            message={message}
            onMessageChange={setMessage}
            isSubmitting={submitTicketMutation.isPending}
            isSubmitted={isSubmitted}
            onSubmit={handleSubmit}
            onReset={() => setIsSubmitted(false)}
          />
        </div>
      </div>
    </div>
  );
};

export default SupportPageCustomer;
