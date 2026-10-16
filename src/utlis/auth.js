import { useEffect, useState } from "react";
import getBaseURL from "./baseURL";

// The backend sets the login token in an httpOnly cookie, which JavaScript
// cannot read. So "am I logged in?" must be answered by asking the server.
// If your app also stores a token in localStorage, it is sent as well.

export const authHeader = () => {
  try {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
};

export const fetchSession = async () => {
  try {
    const res = await fetch(`${getBaseURL()}/api/auth/profile`, {
      credentials: "include",
      headers: { ...authHeader() },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.user || null;
  } catch {
    return null;
  }
};

// Usage: const { user, isLoggedIn, loading } = useAuth();
export default function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchSession().then((u) => {
      if (!active) return;
      setUser(u);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  return { user, isLoggedIn: !!user, loading };
}