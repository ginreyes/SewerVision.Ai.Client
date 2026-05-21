'use client';

import React from 'react';
import NotesPage from '@/components/admin/notes/NotesPage';

/**
 * Team-lead Notes wrapper (May 21).
 *
 * NotesPage already pulls notes for the authenticated userId via
 * notesApi.getNotes(userId, ...), so the team-lead's view is automatically
 * scoped to their own notes today. Wrapping it under
 * src/components/user/notes/ standardises the structure (mirroring the
 * pattern from src/components/user/inbox/ etc.) and gives us a single hook
 * site to layer team-wide aggregation in once notesApi grows a scope=team
 * parameter — see useUserNotes below.
 */
export default function UserNotesPage() {
  return <NotesPage />;
}
