"use client";
import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [authData, setAuthData] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const storedAuthData = localStorage.getItem("authData");
        // Solo guardar datos mínimos y validados
        if (storedAuthData) {
          const parsed = JSON.parse(storedAuthData);
          return {
            user: {
              id: typeof parsed?.user?.id === "string" ? parsed.user.id : null,
              rol:
                typeof parsed?.user?.rol === "string" ? parsed.user.rol : null,
            },
          };
        }
      } catch {
        localStorage.removeItem("authData");
      }
    }
    return null;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (authData?.user?.id && authData?.user?.rol) {
        // Solo guardar datos mínimos y validados
        localStorage.setItem(
          "authData",
          JSON.stringify({
            user: {
              id: authData.user.id,
              rol: authData.user.rol,
            },
          })
        );
        localStorage.setItem("a", authData.user.id);
        localStorage.setItem("b", authData.user.rol);
      } else {
        localStorage.removeItem("authData");
        localStorage.removeItem("a");
        localStorage.removeItem("b");
      }
    }
  }, [authData]);

  useEffect(() => {
    if (authData?.user?.rol !== undefined && authData?.roleChanged) {
      setAuthData(null);
      // window.location.href = '/login';
    }
  }, [authData?.user?.rol, authData?.roleChanged]);

  return (
    <AuthContext.Provider value={{ authData, setAuthData }}>
      {children}
    </AuthContext.Provider>
  );
}
