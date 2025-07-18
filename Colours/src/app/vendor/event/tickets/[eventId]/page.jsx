"use client"
import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import { CreditCard, Loader } from "lucide-react"
import apiUrls from "@/app/components/utils/apiConfig"
import {
  setEventId,
  setTicketData,
  incrementTicket,
  decrementTicket,
  selectTickets,
  selectPrices,
  selectSubtotal,
  selectTotal,
  resetTickets, 
} from "@/lib/slices/ticketsSlice"
import OrdenCompraModal from "@/app/components/entradas/ordenCompraModal"

const API_URL = apiUrls

export default function TicketPurchasePage() {
  const router = useRouter()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [buyerData, setBuyerData] = useState(null)
  const [eventData, setEventData] = useState(null)
  const [ticketTypes, setTicketTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showSummary, setShowSummary] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(false)
  const [orderError, setOrderError] = useState(null)
  const [orderId, setOrderId] = useState(null)

  // Estados para métodos de pago
  const [paymentMethods, setPaymentMethods] = useState([])
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("")
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(false)
  const [paymentMethodError, setPaymentMethodError] = useState(null)

  // Estados para cálculo de impuestos
  const [taxCalculation, setTaxCalculation] = useState({
    baseAmount: 0,
    taxAmount: 0,
    finalTotal: 0,
    taxPercentage: 0,
    methodName: "",
  })

  // Redux
  const dispatch = useDispatch()
  const tickets = useSelector(selectTickets)
  const prices = useSelector(selectPrices)
  const subtotal = useSelector(selectSubtotal)
  const total = useSelector(selectTotal)

  // Cargar métodos de pago
  const fetchPaymentMethods = async () => {
    try {
      setLoadingPaymentMethods(true)
      setPaymentMethodError(null)
      const response = await fetch(`${API_URL}/api/paymentMethod/`)
      if (!response.ok) {
        throw new Error(`Error al obtener métodos de pago: ${response.status}`)
      }
      const result = await response.json()
      if (result.message === "Métodos de pago obtenidos exitosamente" && result.data) {
        setPaymentMethods(result.data)
      } else {
        throw new Error(result.error || "Error al obtener los métodos de pago")
      }
    } catch (err) {
      console.error("Error fetching payment methods:", err)
      setPaymentMethodError(err.message)
    } finally {
      setLoadingPaymentMethods(false)
    }
  }

  // Función para calcular impuestos cuando cambia el método de pago
  const handlePaymentMethodChange = (methodId) => {
    setSelectedPaymentMethod(methodId)
    if (!methodId) {
      setTaxCalculation({
        baseAmount: subtotal || 0,
        taxAmount: 0,
        finalTotal: subtotal || 0,
        taxPercentage: 0,
        methodName: "",
      })
      return
    }

    const selectedMethod = paymentMethods.find((method) => method.Id === methodId)
    if (selectedMethod) {
      const baseAmount = subtotal || 0
      const taxPercentage = selectedMethod.impuesto || 0
      const taxAmount = Math.round(baseAmount * (taxPercentage / 100) * 100) / 100
      const finalTotal = Math.round((baseAmount + taxAmount) * 100) / 100

      setTaxCalculation({
        baseAmount,
        taxAmount,
        finalTotal,
        taxPercentage,
        methodName: selectedMethod.tipo_de_cobro,
      })
    }
  }

  // Recalcular impuestos cuando cambia el subtotal
  useEffect(() => {
    if (selectedPaymentMethod && paymentMethods.length > 0) {
      handlePaymentMethodChange(selectedPaymentMethod)
    }
  }, [subtotal, selectedPaymentMethod, paymentMethods])

  //  LIMPIAR TICKETS AL CARGAR LA PÁGINA
  useEffect(() => {
    dispatch(resetTickets())
  }, [dispatch])

  // Extraer el ID de manera segura
  useEffect(() => {
    if (pathname) {
      const pathSegments = pathname.split("/")
      const id = pathSegments[pathSegments.length - 1]
      dispatch(setEventId(id))

      // Cargar datos del comprador desde localStorage
      const savedBuyerData = localStorage.getItem("buyerData")
      if (savedBuyerData) {
        setBuyerData(JSON.parse(savedBuyerData))
      } else {
        // Si no hay datos del comprador, redirigir a la página de compra
        router.push(`/vendor/event/${id}/buy`)
      }

      // Cargar datos del evento y tickets disponibles
      fetchEventData(id)
      fetchTicketData(id)
      fetchPaymentMethods()
    }
  }, [pathname, dispatch, router])

  // Función para obtener datos del evento
  const fetchEventData = async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/evento/${id}`)
      const data = await response.json()
      if (data.success) {
        setEventData(data.data)
      }
    } catch (error) {
      console.error("Error fetching event data:", error)
    }
  }

  // Modificar la función fetchTicketData para guardar los datos de tickets en Redux
  const fetchTicketData = async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/entrada/${id}`)
      const data = await response.json()
      if (data.success) {
        setTicketTypes(data.data)
        // Guardar los datos completos de los tickets en Redux
        dispatch(setTicketData(data.data))
      }
    } catch (error) {
      console.error("Error fetching ticket data:", error)
    } finally {
      setLoading(false)
    }
  }

  // Actualizar cantidad de entradas
  const updateTicketCount = (type, increment) => {
    if (increment > 0) {
      dispatch(incrementTicket(type))
    } else {
      dispatch(decrementTicket(type))
    }
  }

 
  const prepareOrderData = () => {
    if (!buyerData) return null

   
    let userId = null
    try {
      const authData = localStorage.getItem("authData")
      if (authData) {
        const parsedAuthData = JSON.parse(authData)
       
        userId = parsedAuthData?.user?.id || null
       
      }
    } catch (error) {
      console.error("Error al obtener userId desde localStorage:", error)
    }

    // Crear el array de detalles con los tickets seleccionados
    const detalles = Object.entries(tickets)
      .filter(([_, cantidad]) => cantidad > 0)
      .map(([entradaId, cantidad]) => {
        const ticketInfo = ticketTypes.find((t) => t.id === entradaId)
        return {
          entradaId,
          cantidad,
          precio_unitario: Number.parseFloat(ticketInfo?.precio || 0),
        }
      })

    return {
      userId: userId, 
      estado: "pendiente",
      dni_cliente: buyerData.dni,
      nombre_cliente: buyerData.name,
      email_cliente: buyerData.email,
      telefono_cliente: buyerData.whatsapp,
      detalles,
      metodoDeCobroId: selectedPaymentMethod || null,
    }
  }

  // Enviar la orden al API y ESPERAR la respuesta
  const submitOrder = async () => {
    const orderData = prepareOrderData()
    if (!orderData) return

    setIsSubmitting(true)
    setOrderError(null)

    try {
  
      const response = await fetch(`${API_URL}/api/order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      })

      const data = await response.json()

      if (response.ok) {
        setOrderSuccess(true)
        const newOrderId = data.id || data.orderId || data.data?.id || data.data?.orderId

        if (newOrderId) {
          setOrderId(newOrderId)
          localStorage.setItem("currentOrderId", newOrderId)
        } else {
          console.warn("No se pudo extraer el orderId de la respuesta:", data)
          const tempId = "TEMP-" + Date.now()
          setOrderId(tempId)
          localStorage.setItem("currentOrderId", tempId)
        }

        localStorage.setItem("orderResponse", JSON.stringify(data))
        setShowSummary(true)
      } else {
        setOrderError(data.message || "Error al procesar la orden")
      }
    } catch (error) {
      console.error("Error submitting order:", error)
      setOrderError("Error de conexión al procesar la orden")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Proceder a la orden de compra
  const proceedToOrder = () => {
    if (!selectedPaymentMethod) {
      alert("Por favor selecciona un método de pago antes de continuar")
      return
    }
    submitOrder()
  }

  // Cerrar el modal
  const closeSummary = () => {
    setShowSummary(false)
  }

  
  const handlePaymentSuccess = () => {
    // Limpiar el estado de tickets
    dispatch(resetTickets())

    // Refrescar los datos de tickets desde el servidor
    const pathSegments = pathname.split("/")
    const id = pathSegments[pathSegments.length - 1]
    fetchTicketData(id)

    // Cerrar el modal
    setShowSummary(false)
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  // Renderizamos un esqueleto básico durante la hidratación o carga
  if (!mounted || loading) {
    return (
      <div className="flex min-h-full w-full flex-col items-center p-4">
        <div className="w-full max-w-md animate-pulse">
          <div className="h-64 bg-gray-700 rounded-lg mb-4"></div>
          <div className="h-8 w-3/4 bg-gray-700 mb-2 rounded"></div>
          <div className="h-4 w-1/2 bg-gray-700 mb-6 rounded"></div>
          <div className="space-y-4">
            <div className="h-12 bg-gray-700 rounded"></div>
            <div className="h-12 bg-gray-700 rounded"></div>
            <div className="h-12 bg-gray-700 rounded"></div>
            <div className="h-12 bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  // Obtener los tickets seleccionados para mostrar en el resumen
  const selectedTickets = Object.entries(tickets)
    .filter(([_, count]) => count > 0)
    .map(([id, count]) => {
      const ticketInfo = ticketTypes.find((t) => t.id === id)
      return {
        id,
        tipo: ticketInfo?.tipo_entrada || "Entrada",
        precio: Number.parseFloat(ticketInfo?.precio || 0),
        cantidad: count,
        subtotal: Number.parseFloat(ticketInfo?.precio || 0) * count,
      }
    })

  return (
    <div className="flex min-h-full w-full flex-col items-center p-4">
      <div className="w-full max-w-md">
        {/* Datos del comprador */}
        {buyerData && (
          <div className="mb-4 p-3 rounded-md border border-[#BF8D6B] bg-[#2D3443]/70">
            <h3 className="text-white text-sm font-medium mb-2">Datos del Comprador</h3>
            <div className="grid grid-cols-2 gap-2 text-xs text-[#EDEEF0]">
              <div>
                <p className="text-gray-400">Nombre:</p>
                <p>{buyerData.name}</p>
              </div>
              <div>
                <p className="text-gray-400">DNI:</p>
                <p>{buyerData.dni}</p>
              </div>
              <div>
                <p className="text-gray-400">WhatsApp:</p>
                <p>{buyerData.whatsapp}</p>
              </div>
              <div>
                <p className="text-gray-400">Email:</p>
                <p className="truncate">{buyerData.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Imagen del evento */}
        <div className="rounded-lg overflow-hidden mb-4 border border-[#BF8D6B]">
          <img
            src={eventData?.image || "/placeholder.svg?height=300&width=400&query=event"}
            alt={eventData?.nombre || "Evento"}
            className="w-full h-48 object-cover"
          />
        </div>

        {/* Información del evento */}
        <h1 className="text-2xl font-bold text-white mb-1">{eventData?.nombre || "Cargando evento..."}</h1>
        <p className="text-sm text-[#EDEEF0] mb-1">{eventData?.lugar || "Área Eventos"}</p>
        <p className="text-sm text-[#EDEEF0] mb-6">{eventData?.fecha || "Fecha por confirmar"}</p>

        {/* Selección de entradas */}
        <div className="space-y-3 mb-6">
          {ticketTypes.map((ticket) => {
            // Verificar si el ticket está agotado
            const isTicketSoldOut = ticket.cantidad === 0
            const currentTicketCount = tickets[ticket.id] || 0
            const canIncrement = currentTicketCount < ticket.cantidad && !isTicketSoldOut
            const canDecrement = currentTicketCount > 0 && !isTicketSoldOut

            return (
              <div
                key={ticket.id}
                className={`flex items-center justify-between p-3 rounded-md border transition-all duration-200 ${
                  isTicketSoldOut ? "border-gray-600 bg-gray-800/50 opacity-60" : "border-[#BF8D6B] bg-[#2D3443]/70"
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`${isTicketSoldOut ? "text-gray-500" : "text-[#EDEEF0]"}`}>
                      {ticket.tipo_entrada}
                    </span>
                    {isTicketSoldOut && (
                      <span className="px-2 py-1 text-xs bg-red-900/50 text-red-300 rounded-full border border-red-700">
                        AGOTADO
                      </span>
                    )}
                  </div>
                  <p className={`text-xs ${isTicketSoldOut ? "text-gray-600" : "text-gray-400"}`}>
                    ${Number.parseFloat(ticket.precio).toLocaleString()}
                  </p>
                  <p className={`text-xs ${isTicketSoldOut ? "text-gray-600" : "text-gray-500"}`}>
                    Disponibles: {ticket.cantidad}
                  </p>
                </div>
                <div className="flex items-center">
                  <button
                    onClick={() => updateTicketCount(ticket.id, -1)}
                    disabled={!canDecrement}
                    className={`w-8 h-8 flex items-center justify-center rounded-md font-bold text-xl transition-all duration-200 ${
                      canDecrement
                        ? "text-white bg-[#2D3443] border border-[#BF8D6B] hover:bg-[#BF8D6B]/20"
                        : "text-gray-600 bg-gray-800 border border-gray-600 cursor-not-allowed"
                    }`}
                    aria-label="Disminuir cantidad"
                  >
                    −
                  </button>
                  <span className={`mx-4 w-4 text-center ${isTicketSoldOut ? "text-gray-500" : "text-white"}`}>
                    {currentTicketCount}
                  </span>
                  <button
                    onClick={() => updateTicketCount(ticket.id, 1)}
                    disabled={!canIncrement}
                    className={`w-8 h-8 flex items-center justify-center rounded-md font-bold text-xl transition-all duration-200 ${
                      canIncrement
                        ? "text-white bg-[#2D3443] border border-[#BF8D6B] hover:bg-[#BF8D6B]/20"
                        : "text-gray-600 bg-gray-800 border border-gray-600 cursor-not-allowed"
                    }`}
                    aria-label="Aumentar cantidad"
                  >
                    +
                  </button>
                </div>
              </div>
            )
          })}
          {ticketTypes.length === 0 && (
            <div className="p-3 rounded-md border border-[#BF8D6B] text-center text-[#EDEEF0]">
              No hay entradas disponibles para este evento
            </div>
          )}
        </div>

        {/* Sección de método de pago */}
        <div className="mb-6 p-4 rounded-md border border-[#BF8D6B] bg-[#2D3443]/70">
          <div className="flex items-center mb-3">
            <CreditCard className="h-5 w-5 mr-2 text-[#BF8D6B]" />
            <h3 className="text-white text-sm font-medium">Método de Pago</h3>
          </div>
          {loadingPaymentMethods ? (
            <div className="flex items-center justify-center py-4">
              <Loader className="h-4 w-4 animate-spin mr-2 text-[#BF8D6B]" />
              <span className="text-sm text-[#EDEEF0]">Cargando métodos de pago...</span>
            </div>
          ) : paymentMethodError ? (
            <div className="p-3 bg-red-900/50 border border-red-700 rounded text-red-300 text-sm">
              Error: {paymentMethodError}
            </div>
          ) : (
            <>
              <select
                value={selectedPaymentMethod}
                onChange={(e) => handlePaymentMethodChange(e.target.value)}
                className="w-full p-3 bg-[#2D3443] border border-[#BF8D6B] rounded-md text-[#EDEEF0] focus:outline-none focus:ring-2 focus:ring-[#BF8D6B] text-sm"
              >
                <option value="">Seleccionar método de pago</option>
                {paymentMethods.map((method) => (
                  <option key={method.Id} value={method.Id}>
                    {method.tipo_de_cobro} {method.impuesto > 0 && `(+${method.impuesto}% impuesto)`}
                  </option>
                ))}
              </select>
              {selectedPaymentMethod && (
                <div className="mt-3 p-3 bg-blue-900/30 border border-blue-700 rounded-md">
                  <h4 className="font-medium text-blue-300 mb-2">✓ {taxCalculation.methodName}</h4>
                  {taxCalculation.taxPercentage > 0 && (
                    <p className="text-sm text-blue-400">
                      Se aplicará un impuesto del {taxCalculation.taxPercentage}% sobre el total
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Resumen de costos con desglose detallado */}
        <div
          className="p-4 rounded-md border border-dashed border-[#BF8D6B] mb-4"
          style={{ backgroundColor: "rgba(45, 52, 67, 0.5)" }}
        >
          <div className="flex justify-between mb-2">
            <span className="text-[#EDEEF0]">Subtotal</span>
            <span className="text-white">${subtotal.toLocaleString()}</span>
          </div>
          {selectedPaymentMethod && taxCalculation.taxAmount > 0 && (
            <>
              <div className="flex justify-between text-orange-400 mb-2">
                <span className="text-sm">
                  + Impuesto {taxCalculation.methodName} ({taxCalculation.taxPercentage}%)
                </span>
                <span>+${taxCalculation.taxAmount.toLocaleString()}</span>
              </div>
              <div className="border-t border-gray-600 pt-2">
                <div className="flex justify-between">
                  <span className="text-[#EDEEF0] font-medium">Total con impuestos</span>
                  <span className="text-orange-400 font-bold">${taxCalculation.finalTotal.toLocaleString()}</span>
                </div>
              </div>
            </>
          )}
          {(!selectedPaymentMethod || taxCalculation.taxAmount === 0) && (
            <div className="border-t border-gray-600 pt-2">
              <div className="flex justify-between">
                <span className="text-[#EDEEF0] font-medium">Total</span>
                <span className="text-white font-bold">${subtotal.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>

        {/* Total final más prominente */}
        <div className="flex justify-between p-4 rounded-md mb-6 bg-[#EDEEF0] border-2 border-[#BF8D6B]">
          <span className="font-bold text-[#202020] text-lg">Total a pagar</span>
          <span className="font-bold text-[#202020] text-xl">
            $
            {selectedPaymentMethod && taxCalculation.taxAmount > 0
              ? taxCalculation.finalTotal.toLocaleString()
              : subtotal.toLocaleString()}
          </span>
        </div>

        {/* Botón de pago */}
        <button
          onClick={proceedToOrder}
          disabled={Object.values(tickets).every((count) => count === 0) || isSubmitting || !selectedPaymentMethod}
          className={`w-full rounded-md py-3 font-medium text-white mb-4 ${
            Object.values(tickets).every((count) => count === 0) || isSubmitting || !selectedPaymentMethod
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-[#BF8D6B]"
          }`}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Creando orden...
            </span>
          ) : !selectedPaymentMethod ? (
            "Selecciona método de pago"
          ) : (
            "Orden de compra"
          )}
        </button>
      </div>

      {/* Modal de resumen */}
      <OrdenCompraModal
        isOpen={showSummary}
        onClose={closeSummary}
        buyerData={buyerData}
        eventData={eventData}
        selectedTickets={selectedTickets}
        subtotal={subtotal}
        total={selectedPaymentMethod && taxCalculation.taxAmount > 0 ? taxCalculation.finalTotal : subtotal}
        orderSuccess={orderSuccess}
        orderError={orderError}
        orderId={orderId}
        selectedPaymentMethod={selectedPaymentMethod}
        paymentMethodName={taxCalculation.methodName}
        taxDetails={taxCalculation}
    
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  )
}