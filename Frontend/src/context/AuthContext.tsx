import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type UserRole = "customer" | "seller" | "admin" | null;

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  token: string;
}


interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("banacrafts_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (
  email: string,
  password: string,
  role: UserRole
): Promise<boolean> => {
  try {
    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) return false;

    const data = await res.json();

    const loggedInUser: User = {
      id: data._id,
      name: data.name,
      email: data.email,
      role: data.role,
      token: data.token,
    };

    setUser(loggedInUser);
    localStorage.setItem("banacrafts_user", JSON.stringify(loggedInUser));

    return true;
  } catch (error) {
    console.error("Login failed", error);
    return false;
  }
};


  const register = async (name: string, email: string, password: string, role: UserRole): Promise<boolean> => {
    // Simulated registration
    const mockUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      email,
      role,
      token:"mock-token"
    };
    setUser(mockUser);
    localStorage.setItem("banacrafts_user", JSON.stringify(mockUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("banacrafts_user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
