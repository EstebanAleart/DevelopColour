"use client";

import React from "react";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import { Auth0Provider } from "@auth0/auth0-react";
import { Providers } from "./providers";
import { AuthProvider } from "./context/AuthContext";
import Sidebar from "./prueba/components/sidebar";
import "./globals.css";
import { usePathname } from "next/navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });
  const [isMounted, setIsMounted] = React.useState(false);
  const pathname = usePathname(); // Obtener la ruta actual

  // React.useEffect(() => {
  //   setIsMounted(true);

  //   if (typeof window !== "undefined") {
  //     const handleMouseMove = (event) => {
  //       setMousePosition({ x: event.clientX, y: event.clientY });
  //     };

  //     window.addEventListener("mousemove", handleMouseMove);
  //     return () => {
  //       window.removeEventListener("mousemove", handleMouseMove);
  //     };
  //   }
  // }, []);

  return (
    <AuthProvider>
      <Auth0Provider
        domain="dev-fzrdlau1ykpctean.us.auth0.com"
        clientId="pQulLRTRzKGQ0EHSghNfOnErgDouHcrn"
        authorizationParams={{
          redirect_uri:
            typeof window !== "undefined" ? window.location.origin : "",
          audience: "https://dev-fzrdlau1ykpctean.us.auth0.com/api/v2/",
        }}
      >
        <html lang="es">
          <body
            className={`${inter.variable} ${geistSans.variable} ${geistMono.variable} antialiased text-white`}
          >
            <div
              className="flex h-screen"
              style={{
                background: isMounted
                  ? `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(194, 139, 96, 0.85), transparent 80%), #1E2330`
                  : "#1E2330",
              }}
            >
              {pathname.startsWith("/prueba") && <Sidebar />}
              <main className="flex-1 overflow-auto">
                <Providers>{children}</Providers>
              </main>
            </div>
          </body>
        </html>
      </Auth0Provider>
    </AuthProvider>
  );
}
