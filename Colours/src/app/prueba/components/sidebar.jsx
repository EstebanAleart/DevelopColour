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

  // Detectar si es dispositivo móvil al cargar y cuando cambia el tamaño de la ventana
  useEffect(() => {
    const checkIfMobile = () => {
      const mobile = window.innerWidth < 768; // Punto de quiebre para dispositivos móviles
      setIsMobile(mobile);
      // Establecer el estado inicial del sidebar basado en el tamaño de la pantalla
      setIsCollapsed(mobile);
    };

    // Verificar al cargar el componente
    checkIfMobile();

    // Agregar listener para cambios de tamaño de ventana
    window.addEventListener("resize", checkIfMobile);

    // Limpiar el listener cuando el componente se desmonte
    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Función para determinar si un enlace está activo
  const isActive = (href) => {
    return pathname === href;
  };

  return (
    <div
      className={`${
        isCollapsed ? "w-[60px]" : "w-[120px] md:w-[180px]"
      } bg-[#1E2330] text-white border-r border-[#2A2F3D] flex flex-col transition-all duration-300 relative group cursor-pointer`}
      onClick={toggleSidebar}
    >
      {/* Indicador sutil de toggle en el borde derecho */}
      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-[#2A2F3D] rounded-l-md p-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4 text-[#C88D6B]" />
        ) : (
          <ChevronLeft className="h-4 w-4 text-[#C88D6B]" />
        )}
      </div>

      <div
        className="p-4 border-b border-[#2A2F3D]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-center">
          <span className="text-xl font-bold text-white">
            {isCollapsed ? "X" : "X"}
            <span className="text-[#C88D6B]">{isCollapsed ? "" : "event"}</span>
            {isCollapsed ? "" : "App"}
          </span>
        </div>
      </div>

      <nav className="flex-1 py-4">
        <ul className="space-y-2">
          {/* Nuevo icono de perfil */}
          <li onClick={(e) => e.stopPropagation()}>
            <Link
              href="/prueba/profile"
              className={`flex flex-col items-center p-3 ${
                isActive("/prueba/profile")
                  ? "text-[#C88D6B]"
                  : "text-gray-400 hover:text-[#C88D6B]"
              }`}
            >
              <User className="h-5 w-5 mb-1" />
              {!isCollapsed && (
                <span className="text-xs md:text-sm">Mi Perfil</span>
              )}
            </Link>
          </li>
          <li onClick={(e) => e.stopPropagation()}>
            <Link
              href="/prueba/usuarios"
              className={`flex flex-col items-center p-3 ${
                isActive("/prueba/usuarios")
                  ? "text-[#C88D6B]"
                  : "text-gray-400 hover:text-[#C88D6B]"
              }`}
            >
              <LucideHome className="h-5 w-5 mb-1" />
              {!isCollapsed && (
                <span className="text-xs md:text-sm">Usuario</span>
              )}
            </Link>
          </li>
          <li onClick={(e) => e.stopPropagation()}>
            <Link
              href="/prueba/puntos-de-venta"
              className={`flex flex-col items-center p-3 ${
                isActive("/prueba/puntos-de-venta")
                  ? "text-[#C88D6B]"
                  : "text-gray-400 hover:text-[#C88D6B]"
              }`}
            >
              <Store className="h-5 w-5 mb-1" />
              {!isCollapsed && (
                <span className="text-xs md:text-sm">Puntos de Venta</span>
              )}
            </Link>
          </li>
          <li onClick={(e) => e.stopPropagation()}>
            <Link
              href="/prueba/salones"
              className={`flex flex-col items-center p-3 ${
                isActive("/prueba/salones")
                  ? "text-[#C88D6B]"
                  : "text-gray-400 hover:text-[#C88D6B]"
              }`}
            >
              <Building2 className="h-5 w-5 mb-1" />
              {!isCollapsed && (
                <span className="text-xs md:text-sm">Salones</span>
              )}
            </Link>
          </li>
          <li onClick={(e) => e.stopPropagation()}>
            <Link
              href="/prueba/eventos"
              className={`flex flex-col items-center p-3 ${
                isActive("/prueba/eventos")
                  ? "text-[#C88D6B]"
                  : "text-gray-400 hover:text-[#C88D6B]"
              }`}
            >
              <CalendarDays className="h-5 w-5 mb-1" />
              {!isCollapsed && (
                <span className="text-xs md:text-sm">Eventos</span>
              )}
            </Link>
          </li>

          <li onClick={(e) => e.stopPropagation()}>
            <Link
              href="/prueba/vender"
              className={`flex flex-col items-center p-3 ${
                isActive("/prueba/vender")
                  ? "text-[#C88D6B]"
                  : "text-gray-400 hover:text-[#C88D6B]"
              }`}
            >
              <DollarSign className="h-5 w-5 mb-1" />
              {!isCollapsed && (
                <span className="text-xs md:text-sm">Venta</span>
              )}
            </Link>
          </li>

          <li onClick={(e) => e.stopPropagation()}>
            <Link
              href="/prueba/ordenes-y-pagos"
              className={`flex flex-col items-center p-3 ${
                isActive("/prueba/ordenes-y-pagos")
                  ? "text-[#C88D6B]"
                  : "text-gray-400 hover:text-[#C88D6B]"
              }`}
            >
              <CreditCard className="h-5 w-5 mb-1" />
              {!isCollapsed && (
                <span className="text-xs md:text-sm">Ordenes y Pagos</span>
              )}
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
