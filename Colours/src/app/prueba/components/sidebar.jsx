"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LucideHome,
  Store,
  Building2,
  CalendarDays,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  User,
  DollarSign,
} from "lucide-react";

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const checkIfMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setIsCollapsed(mobile);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  const toggleSidebar = (e) => {
    e.stopPropagation();
    setIsCollapsed(!isCollapsed);
  };

  const isActive = (href) => pathname === href;

  return (
    <div
      className={`${
        isCollapsed ? "w-16" : "w-44 md:w-48"
      } bg-black text-white border-r border-gray-900 flex flex-col transition-all duration-300 relative`}
    >
      {/* Toggle */}
      <div
        className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-900 rounded-l-md p-1 cursor-pointer hover:opacity-80 transition-opacity"
        onClick={toggleSidebar}
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4 text-[#C88D6B]" />
        ) : (
          <ChevronLeft className="h-4 w-4 text-[#C88D6B]" />
        )}
      </div>

      {/* Logo */}
      <div
        className={`p-4 border-b border-gray-900 flex items-center ${
          isCollapsed ? "justify-start" : "justify-start"
        }`}
      >
        <span className="text-xl font-bold text-white whitespace-nowrap">
          X
          {!isCollapsed && (
            <>
              <span className="text-[#C88D6B]">event</span>App
            </>
          )}
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4">
        <ul className="flex flex-col gap-1">
          {[
            { href: "/prueba/profile", icon: User, label: "Mi Perfil" },
            { href: "/prueba/usuarios", icon: LucideHome, label: "Usuarios" },
            {
              href: "/prueba/puntos-de-venta",
              icon: Store,
              label: "Puntos de Venta",
            },
            { href: "/prueba/salones", icon: Building2, label: "Salones" },
            { href: "/prueba/eventos", icon: CalendarDays, label: "Eventos" },
            { href: "/prueba/vender", icon: DollarSign, label: "Venta" },
            {
              href: "/prueba/ordenes-y-pagos",
              icon: CreditCard,
              label: "Ordenes y Pagos",
            },
          ].map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center p-3 gap-2 whitespace-nowrap ${
                  isActive(item.href)
                    ? "text-[#C88D6B]"
                    : "text-gray-400 hover:text-[#C88D6B]"
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span
                  className={`text-sm transition-opacity duration-300 ${
                    isCollapsed
                      ? "opacity-0 pointer-events-none w-0"
                      : "opacity-100"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
