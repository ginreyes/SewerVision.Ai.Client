'use client';

import { adminSteps } from './adminSteps';
import { userSteps } from './userSteps';
import { qcTechnicianSteps } from './qcTechnicianSteps';
import { operatorSteps } from './operatorSteps';
import { customerSteps } from './customerSteps';
import { customerRepSteps } from './customerRepSteps';

// Central registry of all role-scoped tour step arrays.
// Keys match the `role` prop accepted by <TourGuide />.
export const tourSteps = {
    admin: adminSteps,
    user: userSteps,
    'qc-technician': qcTechnicianSteps,
    operator: operatorSteps,
    customer: customerSteps,
    'customer-rep': customerRepSteps,
};

export {
    adminSteps,
    userSteps,
    qcTechnicianSteps,
    operatorSteps,
    customerSteps,
    customerRepSteps,
};
