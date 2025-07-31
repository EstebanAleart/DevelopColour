"use client" 

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"


export default function BuyerInfoForm({ eventIdFromParams }) {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    dni: "",
    whatsapp: "",
    email: "",
  })    

  const [eventId, setEventId] = useState(eventIdFromParams || null)


  const [userRole, setUserRole] = useState(null)

  useEffect(() => {
    setMounted(true)
    
    
    const storedRole = localStorage.getItem("b")
    if (storedRole) {
      setUserRole(storedRole)
    
    } else {
      console.warn("Rol del usuario no encontrado en localStorage 'b'.")
     
    }

    
    if (!eventIdFromParams) {
      console.error("Error: Event ID no recibido como prop.")
      
   
    } else {
      // Si el ID cambia (aunque no debería para una página), actualiza el estado
      if (eventIdFromParams !== eventId) {
        setEventId(eventIdFromParams)
      }
      
    }
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSell = () => {
    // Guardar los datos del comprador en localStorage antes de redirigir
    localStorage.setItem("buyerData", JSON.stringify(formData))

   

    // Redirigir a la página de selección de tickets
    const path = userRole === "admin" ? `/prueba/vender/tickets/${eventId}` : `/vendor/event/tickets/${eventId}`
    router.push(path)
  }

  const isFormValid = () => {
    return formData.name && formData.dni && formData.whatsapp && formData.email
  }

  
  if (!mounted || eventId === null || userRole === null) {
    return (
      <main className="min-h-screen w-full flex items-center justify-center bg-[#12151f]/40 p-4">
        <div className="w-full max-w-md bg-[#1E2330]/80 p-6 rounded-xl shadow-lg">
          <p className="text-white">Cargando...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-[#12151f]/40 p-4">
      <div className="w-full max-w-md bg-[#1E2330]/80 p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold text-white mb-6">Datos del Graduado</h2>
        <div className="space-y-3 mb-6">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Nombre y Apellido"
            className="w-full px-3 py-2 bg-transparent border border-[#b3964c] rounded-md text-white placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#b3964c]"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              name="dni"
              value={formData.dni}
              onChange={handleInputChange}
              placeholder="DNI"
              className="w-full px-3 py-2 bg-transparent border border-[#b3964c] rounded-md text-white placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#b3964c]"
            />
            <input
              type="text"
              name="whatsapp"
              value={formData.whatsapp}
              onChange={handleInputChange}
              placeholder="WhatsApp"
              className="w-full px-3 py-2 bg-transparent border border-[#b3964c] rounded-md text-white placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#b3964c]"
            />
          </div>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Email"
            className="w-full px-3 py-2 bg-transparent border border-[#b3964c] rounded-md text-white placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#b3964c]"
          />
        </div>
        <div className="space-y-3">
          <div className="border border-[#b3964c] rounded-md p-3 w-full">
            <div className="text-white mb-2">
              <p className="font-medium">Nombre del Graduado</p>
            </div>
            {isFormValid() && (
              <div className="bg-[#12151f]/40 p-2 rounded-md mb-3 text-sm text-white">
                <div className="flex flex-col space-y-2">
                  <div className="grid grid-cols-2 gap-x-2">
                    <div>
                      <p className="text-gray-400">Graduado:</p>
                      <p className="truncate">{formData.name}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">DNI:</p>
                      <p className="truncate">{formData.dni}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-2">
                    <div>
                      <p className="text-gray-400">WhatsApp:</p>
                      <p className="truncate">{formData.whatsapp}</p>
                    </div>
                    <div className="mt-2 sm:mt-0">
                      <p className="text-gray-400">Email:</p>
                      <p className="truncate">{formData.email}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className="flex justify-end">
              <button
                onClick={handleSell}
                disabled={!isFormValid()}
                className={`px-3 py-1 ${
                  isFormValid() ? "bg-[#b3964c] hover:bg-[#9a7f41]" : "bg-gray-600 cursor-not-allowed"
                } text-black font-medium rounded-md transition-colors`}
              >
                Vender
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
