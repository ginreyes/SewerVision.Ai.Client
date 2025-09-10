"use client";
import { api } from "@/lib/helper";
import { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const username = localStorage.getItem("username");

    const fetchuser = async() =>{
      const {data ,error } = await api(`/api/users/get-user/${username}`)
      
      const user_id = data.user._id
      setUserId(user_id)
    }
    fetchuser()
  
  }, []);

  return <UserContext.Provider value={{ userId }}>{children}</UserContext.Provider>;
};

export const useUser = () => useContext(UserContext);
