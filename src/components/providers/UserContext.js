"use client";
import { api } from "@/lib/helper";
import { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userId, setUserId] = useState(null);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const username = localStorage.getItem("username");
    if (!username) return; 

    const fetchUser = async () => {
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
    };

    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ userId, userData }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
