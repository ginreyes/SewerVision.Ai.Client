"use client";
import { api } from "@/lib/helper";
import { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const username = localStorage.getItem("username");

    const fetchuser = async() =>{
      const {data ,error } = await api(`/api/users/get-user/${username}`)
      const user_id = data.user.user_id
      if (!error) {
        setUserId(user_id)
      } 
      else {
        console.log('error fetching user profile')
      }
      
    }
    fetchuser()
  
  }, []);

  return <UserContext.Provider value={{ userId }}>{children}</UserContext.Provider>;
};

export const useUser = () => useContext(UserContext);
