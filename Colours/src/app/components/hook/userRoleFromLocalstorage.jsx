"use client"
import { useState, useEffect } from "react"

/**
 * Custom hook para obtener el rol del usuario ('b') y el ID del usuario ('a') desde localStorage.
 * Maneja la carga asíncrona y la disponibilidad de 'window'.
 * returns {{ userRole: string | null, userId: string | null }}
 */
export default function useUserRoleFromLocalStorage() {
  const [userRole, setUserRole] = useState(null)
  const [userId, setUserId] = useState(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const storedRole = localStorage.getItem("b")
        const storedUserId = localStorage.getItem("a")

        if (storedRole) {
          setUserRole(storedRole)
        } else {
          console.warn("Rol del usuario no encontrado en localStorage 'b'.")
          setUserRole(null)
        }

        if (storedUserId) {
          setUserId(storedUserId)
        } else {
          console.warn("ID del usuario no encontrado en localStorage 'a'.")
          setUserId(null)
        }
      } catch (error) {
        console.error("Error al obtener datos del usuario desde localStorage:", error)
        setUserRole(null)
        setUserId(null)
      }
    } else {
      setUserRole(null)
      setUserId(null)
    }
  }, []) 
  return { userRole, userId }
}
