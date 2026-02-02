'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AiOutlineLogout } from 'react-icons/ai';
import { RxAvatar } from 'react-icons/rx';
import { FiSearch, FiClock, FiFile, FiUsers, FiSettings } from 'react-icons/fi';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/helper';
import { NotificationBell } from '../NotificationPanel';
import { useUser } from '@/components/providers/UserContext';

// Search categories for icons and styling
const searchCategories = {
  user: { icon: FiUsers, label: 'Users', color: 'text-green-600' },
  project: { icon: FiFile, label: 'Projects', color: 'text-blue-600' },
  observation: { icon: FiSearch, label: 'Observations', color: 'text-purple-600' },
  snapshot: { icon: FiFile, label: 'Snapshots', color: 'text-yellow-600' },
  device: { icon: FiSettings, label: 'Devices', color: 'text-orange-600' },
  upload: { icon: FiFile, label: 'Uploads', color: 'text-gray-600' },
  videofile: { icon: FiFile, label: 'Videos', color: 'text-red-600' },
  calendar: { icon: FiClock, label: 'Events', color: 'text-indigo-600' },
};

const Navbar = (props) => {
  const { openSideBar, role } = props
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const { userData, logout } = useUser();
  const router = useRouter();
  const searchInputRef = useRef(null);
  const searchContainerRef = useRef(null);
  const debounceTimer = useRef(null);

  useEffect(() => {
    const savedHistory = localStorage.getItem('searchHistory');
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }

    const savedRecent = localStorage.getItem('recentSearches');
    if (savedRecent) {
      setRecentSearches(JSON.parse(savedRecent));
    }
  }, []);

  const debouncedSearch = useCallback((query) => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (query.trim().length === 0) {
      setSearchResults([]);
      return;
    }

    debounceTimer.current = setTimeout(async () => {
      if (query.trim().length > 1) {
        await performSearch(query);
      } else {
        setSearchResults([]);
      }
    }, 300);
  }, []);

  const performSearch = async (query) => {
    try {
      setLoading(true);
      setSearchResults([]);

      const response = await api('/api/search/search-all', 'POST', { query });

      console.log('Search API Response:', response);

      if (response.ok && response.data?.success) {
        setSearchResults(response.data.results || []);
      } else {
        setSearchResults([]);
        console.warn('Search failed or no results');
      }
    } catch (error) {
      console.error('Search API error:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    debouncedSearch(value);
  };

  const handleSearchSubmit = (finalQuery = searchQuery) => {
    if (!finalQuery.trim()) return;

    const newHistory = [finalQuery, ...searchHistory.filter((item) => item !== finalQuery)].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));

    const newRecent = [finalQuery, ...recentSearches.filter((item) => item !== finalQuery)].slice(0, 5);
    setRecentSearches(newRecent);
    localStorage.setItem('recentSearches', JSON.stringify(newRecent));

    router.push(`/search?q=${encodeURIComponent(finalQuery)}`);
    setSearchOpen(false);
    setSearchQuery('');
  };

  const handleResultClick = (result) => {
    handleSearchSubmit(result.title);
    router.push(result.url);
  };

  const handleRecentSearchClick = (term) => {
    setSearchQuery(term);
    handleSearchSubmit(term);
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
    setRecentSearches([]);
    localStorage.removeItem('searchHistory');
    localStorage.removeItem('recentSearches');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        setSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard support
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearchSubmit();
    } else if (e.key === 'Escape') {
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    if (logout) {
      logout();
    } else {
      localStorage.removeItem('authToken');
      localStorage.removeItem('role');
      localStorage.removeItem('username');
      router.push('/');
    }
  };

  const handleSettings = () => {
    // Route to the appropriate settings page based on user role
    const currentRole = userData?.role || role;
    const settingsPath = currentRole ? `/${currentRole}/settings` : '/admin/settings';
    router.push(settingsPath);
  };

  const userDisplayName = userData ? `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || userData.username : 'David Flores';
  const userInitials = userDisplayName ? userDisplayName.charAt(0).toUpperCase() : 'U';
  const userRole = userData?.role || role || 'Admin';
  const userAvatar = userData?.avatar || "/avatar_default.png";

  return (
    <nav className="border-b p-4 ">
      <div className="flex justify-between items-center">
        {/* Left: Menu & Search */}
        <div className="flex items-center space-x-4 flex-1">
          <button onClick={openSideBar} className="focus:outline-none">
            <Image src="/Menu.svg" alt="Menu" width={22} height={22} />
          </button>

          <div ref={searchContainerRef} className="relative flex-1 max-w-md">
            <div className="relative flex items-center w-full rounded-lg border border-gray-300 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
              <span className="px-3">
                <FiSearch className="w-5 h-5 text-gray-400" />
              </span>
              <Input
                ref={searchInputRef}
                type="text"
                placeholder="Search anything..."
                className="w-full bg-transparent border-none focus-visible:ring-0 text-gray-700 pr-4"
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => setSearchOpen(true)}
                onKeyDown={handleKeyDown}
              />
            </div>

            {/* Search Dropdown */}
            {searchOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                {/* Results */}
                {searchQuery.length > 1 && (
                  <div className="p-2">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-gray-700">Results</h3>
                      {loading && (
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      )}
                    </div>
                    {searchResults.length > 0 ? (
                      searchResults.map((result) => {
                        const CategoryIcon = searchCategories[result.type]?.icon || FiFile;
                        const categoryColor = searchCategories[result.type]?.color || 'text-gray-600';

                        return (
                          <div
                            key={result.id}
                            className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                            onClick={() => handleResultClick(result)}
                          >
                            {result.imageUrl ? (
                              <Avatar className="w-8 h-8 flex-shrink-0">
                                <AvatarImage src={result.imageUrl} alt={result.title} />
                                <AvatarFallback>{result.title.charAt(0).toUpperCase()}</AvatarFallback>
                              </Avatar>
                            ) : (
                              <CategoryIcon className={`w-4 h-4 mt-0.5 ${categoryColor}`} />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{result.title}</p>
                              {result.description && (
                                <p className="text-xs text-gray-500 truncate">{result.description}</p>
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : !loading ? (
                      <div className="p-2 text-sm text-gray-500 text-center">
                        No results found for "{searchQuery}"
                      </div>
                    ) : null}
                  </div>
                )}

                {/* Recent Searches */}
                {recentSearches.length > 0 && searchQuery.length <= 1 && (
                  <div className="p-2 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                        <FiClock className="w-4 h-4 mr-1" />
                        Recent
                      </h3>
                      <button
                        onClick={clearSearchHistory}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Clear
                      </button>
                    </div>
                    {recentSearches.map((search, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                        onClick={() => handleRecentSearchClick(search)}
                      >
                        <FiClock className="w-3 h-3 text-gray-400" />
                        <span className="text-sm text-gray-700">{search}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Settings, Notifications, Avatar */}
        <div className="flex items-center space-x-4">
          <button className="focus:outline-none" onClick={handleSettings}>
            <Image src="/Setting.png" alt="System Settings" width={22} height={22} className="object-contain" />
          </button>

          <NotificationBell className="focus:outline-none" />

          <span className="text-gray-300">|</span>

          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <button className="focus:outline-none group">
                <div className="relative">
                  <Avatar className="w-10 h-10 ring-2 ring-transparent group-hover:ring-rose-200 transition-all duration-200">
                    <AvatarImage src={userAvatar} alt="User" />
                    <AvatarFallback className="bg-gradient-to-br from-rose-400 to-pink-500 text-white font-semibold">{userInitials}</AvatarFallback>
                  </Avatar>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                </div>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-0 shadow-xl border-0 rounded-xl overflow-hidden" align="end">
              {/* User Info Header */}
              <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 p-4 text-white">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12 ring-2 ring-white/30">
                    <AvatarImage src={userAvatar} alt="User" />
                    <AvatarFallback className="bg-white/20 text-white font-semibold">{userInitials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{userDisplayName}</p>
                    <p className="text-white/80 text-sm truncate">{userRole}</p>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="p-2 bg-white">
                <Link href={userRole ? `/${userRole}/settings` : '/admin/settings'}>
                  <Button variant="ghost" className="w-full justify-start p-3 h-auto rounded-lg hover:bg-gray-50 group">
                    <RxAvatar className="w-5 h-5 mr-3 text-gray-500 group-hover:text-rose-500 transition-colors" />
                    <div className="text-left">
                      <p className="font-medium text-gray-700">Profile</p>
                      <p className="text-xs text-gray-400">View and edit your profile</p>
                    </div>
                  </Button>
                </Link>

                <Link href={userRole ? `/${userRole}/settings?tab=preferences` : '/admin/settings?tab=preferences'}>
                  <Button variant="ghost" className="w-full justify-start p-3 h-auto rounded-lg hover:bg-gray-50 group">
                    <FiSettings className="w-5 h-5 mr-3 text-gray-500 group-hover:text-blue-500 transition-colors" />
                    <div className="text-left">
                      <p className="font-medium text-gray-700">Settings</p>
                      <p className="text-xs text-gray-400">Manage your preferences</p>
                    </div>
                  </Button>
                </Link>

                {(userRole === 'operator' || userData?.role === 'operator') && (
                  <Link href="/operator/settings">
                    <Button variant="ghost" className="w-full justify-start p-3 h-auto rounded-lg hover:bg-gray-50 group">
                      <FiSettings className="w-5 h-5 mr-3 text-gray-500 group-hover:text-cyan-500 transition-colors" />
                      <div className="text-left">
                        <p className="font-medium text-gray-700">Operator Settings</p>
                        <p className="text-xs text-gray-400">Manage operator config</p>
                      </div>
                    </Button>
                  </Link>
                )}

                <Button
                  variant="ghost"
                  className="w-full justify-start p-3 h-auto rounded-lg hover:bg-gray-50 group"
                  onClick={() => {
                    setOpen(false);
                    // Dispatch custom event to trigger tour
                    window.dispatchEvent(new CustomEvent('openTourGuide'));
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-3 text-gray-500 group-hover:text-purple-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <div className="text-left">
                    <p className="font-medium text-gray-700">Tour Guide</p>
                    <p className="text-xs text-gray-400">Learn how to use the app</p>
                  </div>
                </Button>

                <div className="border-t border-gray-100 my-2"></div>

                <Button
                  variant="ghost"
                  className="w-full justify-start p-3 h-auto rounded-lg hover:bg-red-50 group text-red-600"
                  onClick={handleLogout}
                >
                  <AiOutlineLogout className="w-5 h-5 mr-3 group-hover:text-red-600 transition-colors" />
                  <div className="text-left">
                    <p className="font-medium">Log out</p>
                    <p className="text-xs text-red-400">Sign out of your account</p>
                  </div>
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;