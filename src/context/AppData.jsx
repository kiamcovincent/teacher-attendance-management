import { createContext, useContext, useEffect, useState } from 'react';

const STORAGE_KEY = 'faculty-desk-data';
const SESSION_KEY = 'faculty-desk-session';
const SessionContext = createContext(null);
const emptyData = { teacher: null, subjects: [], schedules: [], students: [], attendance: [] };

function readData() {
  try {
    return { ...emptyData, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') };
  } catch {
    return emptyData;
  }
}

export function useAppData() {
  return useContext(SessionContext);
}

export function DataProvider({ children }) {
  const [data, setData] = useState(readData);
  const [signedIn, setSignedIn] = useState(() => (
    sessionStorage.getItem(SESSION_KEY) === 'active' || localStorage.getItem(SESSION_KEY) === 'remembered'
  ));

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  function signIn(rememberMe = false) {
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SESSION_KEY);
    if (rememberMe) localStorage.setItem(SESSION_KEY, 'remembered');
    else sessionStorage.setItem(SESSION_KEY, 'active');
    setSignedIn(true);
  }

  function signOut() {
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SESSION_KEY);
    setSignedIn(false);
  }

  return (
    <SessionContext.Provider value={{ data, setData, signedIn, signIn, signOut }}>
      {children}
    </SessionContext.Provider>
  );
}