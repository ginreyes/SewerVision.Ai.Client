'use client';

import TasksPage from '@/components/tasks/TasksPage';

// Management view that reuses the existing Tasks UI,
// but with a neutral "admin" role so it can see the
// global task picture instead of only personal tasks.
export default function UserTasksPage() {
  return <TasksPage role="admin" />;
}

