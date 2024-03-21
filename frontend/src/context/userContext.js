import React, { createContext, useContext, useState } from "react";

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [reloadTrigger, setReloadTrigger] = useState(false);

  const setUserData = (userData) => {
    setUser(userData);
    console.log(userData);
  };

  const setTotalValue = (total) => {
    setUser((prevUser) => ({
      ...prevUser,
      totalvalue: total,
    }));
  };

  const triggerReload = () => setReloadTrigger((prev) => !prev);

  return (
    <UserContext.Provider
      value={{ user, setUserData, reloadTrigger, triggerReload, setTotalValue }}
    >
      {children}
    </UserContext.Provider>
  );
};
