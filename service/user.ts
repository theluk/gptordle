import { User } from "firebase/auth";
import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "./firebase";

const UserContext = createContext({
  user: null as null | User,
  loading: true,
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return React.createElement(
    UserContext.Provider,
    {
      value: { user, loading },
    },
    children
  );
}

export function useUser() {
  return useContext(UserContext);
}

export function useLoggedInUser() {
  const user = useUser();
  if (user.loading)
    throw new Error(
      "User is loading. Make sure to use this hook inside withAuth"
    );
  if (!user.user)
    throw new Error(
      "User is not logged in. Make sure to use this hook inside withAuth"
    );
  return user.user;
}
