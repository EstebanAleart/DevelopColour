"use client"
import { ArrowLeft, Home, LogOut, Menu, User, CreditCard } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState, useContext } from "react"
import { AuthContext } from "../../context/AuthContext"
import { useAuth0 } from "@auth0/auth0-react"

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const { setAuthData } = useContext(AuthContext)
  const { logout } = useAuth0()

  // Only show back button if not on home page and not on vendor page
  const showBackButton = pathname !== "/" && pathname !== "/vendor"
  // Show logout button only on vendor page
  const showLogoutButton = pathname === "/vendor"

  const handleLogout = () => {
    setAuthData(null) // Borra el estado de la sesión
    localStorage.removeItem("authData") // Borra los datos del localStorage
    logout({ returnTo: window.location.origin }) // Cierra la sesión de Auth0
    setTimeout(() => {
      router.push("/login") // Redirige a la ruta /login después de un breve retraso
    }, 500) // Retraso de 500ms
  }

  return (
    <nav className="w-full bg-[#1E2330] text-white p-4 flex justify-between items-center">
      <div className="flex items-center">
        <button onClick={() => setMenuOpen(!menuOpen)} className="p-2">
          <Menu className="h-6 w-6" />
        </button>
        {menuOpen && (
          <div className="absolute left-0 top-14 mt-2 w-48 bg-[#252e3f] rounded-md shadow-lg z-50">
            <Link
              href="/vendor"
              className="block px-4 py-2 text-sm hover:bg-[#1e2533] flex items-center"
              onClick={() => setMenuOpen(false)}
            >
              <Home className="h-4 w-4 mr-2" />
              Home
            </Link>
            <Link
              href="/vendor/profile"
              className="block px-4 py-2 text-sm hover:bg-[#1e2533] flex items-center"
              onClick={() => setMenuOpen(false)}
            >
              <User className="h-4 w-4 mr-2" />
              Mi Perfil
            </Link>
            {/* ✅ NUEVO: Enlace a Órdenes y Pagos */}
            <Link
              href="/vendor/ordenes-y-pagos"
              className="block px-4 py-2 text-sm hover:bg-[#1e2533] flex items-center"
              onClick={() => setMenuOpen(false)}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Órdenes y Pagos
            </Link>
          </div>
        )}
      </div>
      <Link href="/" className="text-xl font-bold  left-1/2 transform -translate-x-1/2">
        XEVENT
      </Link>
      {showBackButton && (
        <button onClick={() => router.back()} className="p-2">
          <ArrowLeft className="h-6 w-6" />
        </button>
      )}
      {showLogoutButton && (
        <button onClick={handleLogout} className="p-2 flex items-center text-sm">
          <LogOut className="h-5 w-5 mr-1" />
          <span>Salir</span>
        </button>
      )}
      {!showBackButton && !showLogoutButton && <div className="w-10"></div>} {/* Spacer when no button is shown */}
    </nav>
  )
}
