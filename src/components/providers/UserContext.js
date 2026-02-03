"use client";
import { api } from "@/lib/helper";
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userId, setUserId] = useState(null);
  const [userData, setUserData] = useState(null);
  const router = useRouter();

  const fetchUser = useCallback(async () => {
    const username = localStorage.getItem("username");
    if (!username) return;

    try {
      const { data, error } = await api(`/api/users/get-user/${username}`);
      if (error) {
        console.error("Error fetching user:", error);
        return;
      }
      if (data?.user) {
        setUserId(data.user._id);
        setUserData(data.user);
      }
    } catch (e) {
      console.error("Unexpected error fetching user:", e);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Update user data locally (for reactive UI updates like avatar)
  const updateUserData = useCallback((newData) => {
    setUserData(prevData => ({
      ...prevData,
      ...newData
    }));
  }, []);

  // Refetch user data from server
  const refetchUser = useCallback(() => {
    fetchUser();
  }, [fetchUser]);

  // Logout function
  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    localStorage.removeItem("authToken");
    setUserId(null);
    setUserData(null);
    router.push("/login");
  }, [router]);

  return (
    <UserContext.Provider value={{
      userId,
      userData,
      updateUserData,
      refetchUser,
      logout
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
