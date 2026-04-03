/**
 * Billing module seed/default data.
 * Replace with API calls when live billing endpoints are available.
 */

export const SEED_INVOICES = [
  { id: 'INV-0041', customer: 'Hydro Corp', amount: 4800, status: 'paid', date: '2026-03-01', due: '2026-03-15', tier: 'Enterprise' },
  { id: 'INV-0042', customer: 'City Council', amount: 2400, status: 'paid', date: '2026-03-01', due: '2026-03-15', tier: 'Professional' },
  { id: 'INV-0043', customer: 'Greenfield LLC', amount: 1200, status: 'pending', date: '2026-03-01', due: '2026-03-22', tier: 'Standard' },
  { id: 'INV-0044', customer: 'Metro Water', amount: 6000, status: 'overdue', date: '2026-02-01', due: '2026-02-15', tier: 'Enterprise' },
  { id: 'INV-0045', customer: 'Oakdale District', amount: 3200, status: 'paid', date: '2026-03-05', due: '2026-03-20', tier: 'Professional' },
  { id: 'INV-0046', customer: 'Eastern Utilities', amount: 900, status: 'draft', date: '2026-03-20', due: '2026-04-05', tier: 'Standard' },
  { id: 'INV-0047', customer: 'Pacific Pipeline', amount: 7500, status: 'pending', date: '2026-03-10', due: '2026-03-25', tier: 'Enterprise' },
];
