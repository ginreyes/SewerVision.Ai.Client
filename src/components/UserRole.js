'use client';

import React, { useEffect, useState } from 'react';

export default function UserRole({ username }) {
  const [role, setRole] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchRole() {
      try {
        const res = await fetch(`/api/users/role/${username}`);
        if (!res.ok) throw new Error('Failed to fetch role');
        const data = await res.json();
        setRole(data.role);
      } catch (err) {
        setError(err.message);
      }
    }

    if (username) {
      console.log('data:',username)
      fetchRole();
    }
  }, [username]);

  if (error) return <div>Error: {error}</div>;
  if (!role) return <div>Loading...</div>;

  return <div>User role: {role}</div>;
}
