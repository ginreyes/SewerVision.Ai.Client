'use client'

/**
 * Example: Using TanStack Query Hooks in a Dashboard Component
 * 
 * This file demonstrates how to migrate from useEffect/useState patterns
 * to TanStack Query for data fetching in SewerVision.ai
 * 
 * Benefits:
 * - Automatic caching and cache invalidation
 * - Stale-while-revalidate updates
 * - Optimistic updates for mutations
 * - Automatic refetching on window focus
 * - Better loading/error state management
 * - DevTools for debugging
 */

import {
    useDashboardStats,
    useQCDashboardStats,
    useQCAssignments,
    useNotes,
    useCreateNote,
    useUpdateNote,
    useDeleteNote,
    useQueryUtilities
} from '@/hooks'

// ============================================
// EXAMPLE 1: Simple Data Fetching
// ============================================

/**
 * Before (with useEffect/useState):
 * 
 * const [data, setData] = useState(null)
 * const [loading, setLoading] = useState(true)
 * const [error, setError] = useState(null)
 * 
 * useEffect(() => {
 *   const fetchData = async () => {
 *     try {
 *       const response = await dashboardApi.getDashboardStats()
 *       setData(response)
 *     } catch (err) {
 *       setError(err)
 *     } finally {
 *       setLoading(false)
 *     }
 *   }
 *   fetchData()
 * }, [])
 */

// After (with TanStack Query):
function DashboardStatsExample() {
    const {
        data,      // The fetched data
        isLoading, // True while fetching for the first time
        isError,   // True if there was an error
        error,     // The error object
        isFetching, // True while any fetch is in progress
        refetch    // Function to manually refetch
    } = useDashboardStats()

    if (isLoading) return <div>Loading stats...</div>
    if (isError) return <div>Error: {error.message}</div>

    return (
        <div>
            <h2>Dashboard Stats</h2>
            <p>Total Projects: {data?.totalProjects}</p>
            <p>Active Users: {data?.activeUsers}</p>
            <button onClick={() => refetch()}>Refresh</button>
        </div>
    )
}

// ============================================
// EXAMPLE 2: Data Fetching with Parameters
// ============================================

function QCDashboardExample({ qcTechnicianId }) {
    // Query is automatically disabled if qcTechnicianId is falsy
    const { data, isLoading, isError } = useQCDashboardStats(qcTechnicianId)

    // Fetch assignments with status filter
    const { data: assignments } = useQCAssignments(qcTechnicianId, 'pending')

    if (isLoading) return <div>Loading QC dashboard...</div>

    return (
        <div>
            <h2>QC Technician Dashboard</h2>
            <p>Completed Reviews: {data?.completedReviews}</p>
            <p>Pending Assignments: {assignments?.length}</p>
        </div>
    )
}

// ============================================
// EXAMPLE 3: Mutations (Create/Update/Delete)
// ============================================

function NotesExample({ userId }) {
    // Fetch notes
    const { data: notes, isLoading } = useNotes(userId)

    // Mutations with automatic cache invalidation
    const createNoteMutation = useCreateNote()
    const updateNoteMutation = useUpdateNote()
    const deleteNoteMutation = useDeleteNote()

    const handleCreateNote = async () => {
        try {
            await createNoteMutation.mutateAsync({
                userId,
                title: 'New Note',
                content: 'Note content here',
                category: 'general'
            })
            // Cache is automatically invalidated - notes will refetch
        } catch (error) {
            console.error('Failed to create note:', error)
        }
    }

    const handleUpdateNote = async (noteId, updates) => {
        await updateNoteMutation.mutateAsync({
            noteId,
            noteData: updates
        })
        // Cache is automatically invalidated
    }

    const handleDeleteNote = async (noteId) => {
        await deleteNoteMutation.mutateAsync({ noteId, userId })
        // Cache is automatically invalidated
    }

    if (isLoading) return <div>Loading notes...</div>

    return (
        <div>
            <button
                onClick={handleCreateNote}
                disabled={createNoteMutation.isPending}
            >
                {createNoteMutation.isPending ? 'Creating...' : 'Add Note'}
            </button>

            {notes?.map(note => (
                <div key={note._id}>
                    <h3>{note.title}</h3>
                    <button onClick={() => handleDeleteNote(note._id)}>
                        Delete
                    </button>
                </div>
            ))}
        </div>
    )
}

// ============================================
// EXAMPLE 4: Cache Utilities
// ============================================

function CacheManagementExample() {
    const {
        prefetchDashboardStats,
        invalidateQueries,
        clearAllCache,
        getCachedData,
        refetchQuery
    } = useQueryUtilities()

    // Prefetch data before navigation
    const handlePrefetch = () => {
        prefetchDashboardStats()
    }

    // Invalidate specific queries (triggers refetch)
    const handleInvalidate = () => {
        invalidateQueries(['notes']) // Invalidate all note queries
        invalidateQueries(['qc', 'dashboard']) // Invalidate QC dashboard
    }

    // Get cached data without triggering a refetch
    const handleGetCachedData = () => {
        const cachedStats = getCachedData(['dashboard', 'stats'])
        console.log('Cached stats:', cachedStats)
    }

    // Clear all cache (use sparingly, e.g., on logout)
    const handleClearAllCache = () => {
        clearAllCache()
    }

    return (
        <div>
            <button onClick={handlePrefetch}>Prefetch Dashboard</button>
            <button onClick={handleInvalidate}>Invalidate Queries</button>
            <button onClick={handleGetCachedData}>Get Cached Data</button>
            <button onClick={handleClearAllCache}>Clear All Cache</button>
        </div>
    )
}

// ============================================
// EXAMPLE 5: Filters and Pagination
// ============================================

function NotesWithFiltersExample({ userId }) {
    const [filters, setFilters] = React.useState({
        category: 'all',
        isPinned: undefined,
        search: ''
    })

    // Query key includes filters - new query on filter change
    const { data: notes, isLoading } = useNotes(userId, filters)

    return (
        <div>
            <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
            >
                <option value="all">All Categories</option>
                <option value="general">General</option>
                <option value="inspection">Inspection</option>
            </select>

            <input
                type="text"
                placeholder="Search..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            />

            {isLoading ? (
                <div>Loading...</div>
            ) : (
                notes?.map(note => (
                    <div key={note._id}>{note.title}</div>
                ))
            )}
        </div>
    )
}

export {
    DashboardStatsExample,
    QCDashboardExample,
    NotesExample,
    CacheManagementExample,
    NotesWithFiltersExample
}
