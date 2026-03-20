# Customer Tour Guide Fix + Settings Module Plan

## Task 1: Fix Customer Tour Guide (ReactTour) — Alignment & UI

**Problem:** The CustomerReactTour tour steps may not be aligned/styled consistently with the modal TourGuide.

**Changes to `src/components/customer/CustomerReactTour.js`:**
- Update the tour steps to include Settings sidebar item (new step after Support)
- Improve step content styling to be more polished and consistent
- Ensure `data-tour` attributes are aligned with actual DOM elements
- Add a step for the new Settings page

## Task 2: Create Customer Settings Page

**Reference:** `src/app/user/settings/page.js` (team lead settings)

**New file: `src/app/customer/settings/page.js`**
- Adapted from user/team-lead settings page
- **Profile tab:** First name, last name, email (read-only), phone, department — with edit/cancel/save
- **Avatar upload:** Same camera overlay + upload button pattern, uses `/api/users/upload-avatar/{userId}`
- **Password change:** Current password, new password, confirm — uses `/api/auth/change-password`
- Simpler than user settings — only Profile tab (includes security section within it), no notifications/preferences tabs (customer doesn't manage those)
- Uses the same API endpoints as user settings (they're role-agnostic)
- Rose/pink accent colors to match customer theme
- Customer-specific subtitle: "Manage your account settings"

## Task 3: Add Settings to Customer Sidebar

**File: `src/components/customer/CustomerSidebar.js`**
- Add Settings menu item with `Settings` icon from lucide-react
- Path: `/customer/settings`
- Tour ID: `customer-sidebar-settings`

## Task 4: Update CustomerReactTour Steps

**File: `src/components/customer/CustomerReactTour.js`**
- Add step for `[data-tour="customer-sidebar-settings"]` — Settings
- Update the final step text to mention settings
- Make sure tour step content UI matches the styling pattern (consistent headings, descriptions)

## Task 5: Update TourGuide Modal Steps for Customer

**File: `src/components/TourGuide.jsx`**
- Add a "Settings" step to the customer tour steps array (between reports and complete)
- Include illustration showing profile/avatar/password UI mockup
- Tips about changing password, uploading avatar, etc.

## Implementation Order
1. Create customer settings page
2. Add Settings to sidebar
3. Update CustomerReactTour steps
4. Update TourGuide customer steps
