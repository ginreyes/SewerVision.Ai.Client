# Concertina Frontend - Developer Guide

## Overview

This is the frontend application for Concertina, built with Next.js 14+ and React. It provides dashboards and tools for operators, QC technicians, and administrators to manage sewer inspection workflows.

---

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn

### Installation

```bash
cd concertina_front_end
npm install
```

### Environment Variables

Create a `.env.local` file with:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── admin/              # Admin dashboard pages
│   ├── operator/           # Operator dashboard pages
│   ├── qc-technician/      # QC Technician dashboard pages
│   ├── customer/           # Customer portal pages
│   └── api/                # API routes (if any)
├── components/             # Reusable components
│   ├── qc/                 # QC-specific components
│   │   ├── DetectionCard.jsx
│   │   ├── StatsCard.jsx
│   │   ├── LoadingState.jsx
│   │   ├── ErrorState.jsx
│   │   ├── EmptyState.jsx
│   │   └── index.js
│   └── providers/          # Context providers
├── hooks/                  # Custom React hooks
│   ├── usePolling.js       # Real-time data polling
│   ├── useDebounce.js      # Debounce & throttle utilities
│   ├── useCache.js         # Client-side caching
│   ├── usePerformance.js   # Performance monitoring
│   └── index.js            # Barrel exports
├── data/                   # API data fetchers
│   ├── qcApi.js            # QC-related API calls
│   └── dashboardApi.js     # Dashboard API calls
└── lib/                    # Utilities
    ├── helper.js           # General helpers & API client
    └── apiUtils.js         # API utilities with retry logic
```

---

## Custom Hooks

### `usePolling`

Real-time data fetching with automatic polling.

```javascript
import { usePolling } from '@/hooks'

const { refresh, lastUpdated, isPolling, pause, resume } = usePolling(
  fetchFunction,
  30000, // 30 seconds interval
  {
    enabled: true,
    immediate: true,
    onError: (err) => console.error(err),
    onSuccess: (data) => setData(data)
  }
)
```

### `useDebounce`

Debounce values or callbacks.

```javascript
import { useDebounce, useDebouncedCallback, useThrottle } from '@/hooks'

// Debounce a value
const debouncedSearchTerm = useDebounce(searchTerm, 300)

// Debounce a callback
const debouncedSearch = useDebouncedCallback((term) => {
  api.search(term)
}, 300)

// Throttle a callback
const throttledScroll = useThrottle(() => {
  updateScrollPosition()
}, 100)
```

### `useCache`

Client-side caching with TTL.

```javascript
import { useCache } from '@/hooks'

const { data, isLoading, error, refresh, clear } = useCache(
  'cache-key',
  fetchFunction,
  { ttl: 60000 } // 1 minute TTL
)
```

---

## Reusable Components

### Import Components

```javascript
import { 
  DetectionCard, 
  StatsCard, 
  LoadingState, 
  ErrorState, 
  EmptyState 
} from '@/components/qc'
```

### `StatsCard`

Display statistics with icons and optional trends.

```jsx
<StatsCard
  icon={AlertTriangle}
  value={42}
  label="Critical Alerts"
  iconColor="text-red-600"
  bgColor="bg-red-100"
  trend={-5}
  trendLabel="vs last week"
/>
```

**Props:**
- `icon` - Lucide icon component
- `value` - Statistic value
- `label` - Description label
- `iconColor` - Tailwind color class
- `bgColor` - Background color class
- `trend` - Percentage change (optional)
- `size` - 'sm' | 'default' | 'lg'
- `loading` - Show loading skeleton

### `DetectionCard`

Display AI detection items with expandable details.

```jsx
<DetectionCard
  detection={detection}
  isExpanded={expandedId === detection.id}
  isSelected={selectedId === detection.id}
  onSelect={handleSelect}
  onToggleExpand={handleExpand}
  onApprove={handleApprove}
  onReject={handleReject}
  getSeverityColor={getSeverityColor}
  getConfidenceColor={getConfidenceColor}
/>
```

### `LoadingState`

Consistent loading indicators.

```jsx
<LoadingState 
  message="Loading data..."
  size="default"       // 'sm' | 'default' | 'lg'
  variant="default"    // 'default' | 'minimal' | 'overlay'
  spinnerColor="text-rose-600"
/>
```

### `ErrorState`

Error display with retry action.

```jsx
<ErrorState
  message="Failed to load data"
  onRetry={handleRetry}
  showIcon={true}
  variant="default"  // 'default' | 'minimal' | 'inline'
/>
```

### `EmptyState`

Empty content placeholders.

```jsx
<EmptyState
  icon={Search}
  title="No Results"
  message="Try adjusting your filters"
  variant="search"    // 'default' | 'search' | 'error'
  action={{ label: "Clear Filters", onClick: clearFilters }}
/>
```

---

## API Utilities

### Basic API Call

```javascript
import { api } from '@/lib/helper'

const response = await api('/api/endpoint', 'GET')
if (response.ok) {
  console.log(response.data)
}
```

### With Retry Logic

```javascript
import { withRetry, dedupeRequest } from '@/lib/apiUtils'

// Retry failed requests with exponential backoff
const data = await withRetry(
  () => api('/api/endpoint', 'GET'),
  { maxRetries: 3, baseDelay: 1000 }
)

// Dedupe concurrent identical requests
const data = await dedupeRequest('unique-key', () => fetchData())
```

---

## Dashboard Features

### Operator Dashboard

- Real-time equipment status monitoring
- Sortable operations table (click column headers)
- Equipment detail modal
- Alert trend visualization
- Downtime tracking charts

**Keyboard Shortcuts:** None

### QC Technician Dashboard

- Detection review workflow
- Severity and status filtering
- Bulk approve/reject actions
- Real-time data polling (30s)

**Keyboard Shortcuts:**
- `A` - Approve selected detection
- `R` - Reject selected detection
- `↑` / `↓` - Navigate detections
- `Escape` - Deselect

---

## Performance Optimizations

### Implemented

1. **Memoization** - `useMemo` and `useCallback` for expensive computations
2. **Debouncing** - Search inputs debounced at 300ms
3. **Polling** - Smart polling with pause/resume capability
4. **Component Memoization** - `React.memo` on list items
5. **Lazy Loading** - Chart data loaded on demand

### Best Practices

```javascript
// Good: Memoize expensive computations
const filteredData = useMemo(() => {
  return data.filter(item => item.status === filter)
}, [data, filter])

// Good: Memoize callbacks passed to children
const handleClick = useCallback((id) => {
  setSelected(id)
}, [])

// Good: Use debounce for search
const debouncedSearch = useDebounce(searchTerm, 300)
```

---

## Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage
```

---

## Build & Deployment

```bash
# Production build
npm run build

# Start production server
npm start

# Export static files (if configured)
npm run export
```

---

## Troubleshooting

### Common Issues

**1. API Connection Failed**
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Ensure backend server is running

**2. Charts Not Rendering**
- Verify Chart.js is installed
- Check canvas ref is properly attached

**3. Polling Not Working**
- Check `enabled` prop is truthy
- Verify component is mounted

---

## Contributing

1. Create feature branch from `main`
2. Follow existing code patterns
3. Add JSDoc comments for new functions
4. Test on all supported browsers
5. Submit PR with description

---

## Browser Support

- Chrome 120+
- Firefox 121+
- Safari 17+
- Edge 120+
