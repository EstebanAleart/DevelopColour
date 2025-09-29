"use client"
import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import { CreditCard, Loader } from 'lucide-react'
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

  const [selectedInstallment, setSelectedInstallment] = useState("")
  const [currentPaymentMethodData, setCurrentPaymentMethodData] = useState(null)

  // Estados para cálculo de impuestos
  const [taxCalculation, setTaxCalculation] = useState({
    baseAmount: 0,
    taxAmount: 0,
    finalTotal: 0,
    taxPercentage: 0,
    methodName: "",
    installments: 1,
  })

  const dispatch = useDispatch()
  const tickets = useSelector(selectTickets)
  const prices = useSelector(selectPrices)
  const subtotal = useSelector(selectSubtotal)
  const total = useSelector(selectTotal)

  const processTicketData = (ticketData) => {
    const flatTickets = []

    ticketData.forEach((ticket) => {
      if (ticket.subtipos && ticket.subtipos.length > 0) {
        ticket.subtipos.forEach((subtipo) => {
          flatTickets.push({
            id: subtipo.id,
            tipo_entrada: `${ticket.tipo_entrada} - ${subtipo.nombre}`,
            precio: subtipo.precio,
            cantidad: subtipo.cantidad_disponible,
            parentId: ticket.id,
            isSubtype: true,
          })
        })
      } else {
        flatTickets.push({
          id: ticket.id,
          tipo_entrada: ticket.tipo_entrada,
          precio: ticket.precio || 0,
          cantidad: ticket.cantidad_real || 0,
          parentId: null,
          isSubtype: false,
        })
      }
    })

    return flatTickets
  }

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

  const fetchPaymentMethodDetails = async (methodId) => {
    try {
      const response = await fetch(`${API_URL}/api/paymentMethod/${methodId}`)
      if (!response.ok) {
        throw new Error(`Error al obtener detalles del método de pago: ${response.status}`)
      }
      const result = await response.json()
      if (result.message === "Método de pago encontrado" && result.data) {
        setCurrentPaymentMethodData(result.data)
        return result.data
      } else {
        throw new Error(result.error || "Error al obtener los detalles del método de pago")
      }
    } catch (err) {
      console.error("Error fetching payment method details:", err)
      setPaymentMethodError(err.message)
      return null
    }
  }

  const handlePaymentMethodChange = async (methodId) => {
    setSelectedPaymentMethod(methodId)
    setSelectedInstallment("")
    setCurrentPaymentMethodData(null)

    if (!methodId) {
      setTaxCalculation({
        baseAmount: subtotal || 0,
        taxAmount: 0,
        finalTotal: subtotal || 0,
        taxPercentage: 0,
        methodName: "",
        installments: 1,
      })
      return
    }

    const methodDetails = await fetchPaymentMethodDetails(methodId)
    if (methodDetails) {
      const selectedMethod = paymentMethods.find((method) => method.Id === methodId)
      setTaxCalculation((prev) => ({
        ...prev,
        methodName: selectedMethod?.tipo_de_cobro || "",
      }))
    }
  }

  const handleInstallmentChange = (installmentKey) => {
    setSelectedInstallment(installmentKey)

    if (!installmentKey || !currentPaymentMethodData) {
      setTaxCalculation((prev) => ({
        ...prev,
        taxAmount: 0,
        finalTotal: subtotal || 0,
        taxPercentage: 0,
        installments: 1,
      }))
      return
    }

    const baseAmount = subtotal || 0
    const taxPercentage = currentPaymentMethodData.impuesto[installmentKey] || 0
    const taxAmount = Math.round(baseAmount * (taxPercentage / 100) * 100) / 100
    const finalTotal = Math.round((baseAmount + taxAmount) * 100) / 100

    setTaxCalculation((prev) => ({
      ...prev,
      baseAmount,
      taxAmount,
      finalTotal,
      taxPercentage,
      installments: Number.parseInt(installmentKey),
    }))
  }

  useEffect(() => {
    if (selectedInstallment && currentPaymentMethodData) {
      handleInstallmentChange(selectedInstallment)
    }
  }, [subtotal, selectedInstallment, currentPaymentMethodData])

  useEffect(() => {
    dispatch(resetTickets())
  }, [dispatch])

  useEffect(() => {
    if (pathname) {
      const pathSegments = pathname.split("/")
      const id = pathSegments[pathSegments.length - 1]
      dispatch(setEventId(id))

      const savedBuyerData = localStorage.getItem("buyerData")
      if (savedBuyerData) {
        setBuyerData(JSON.parse(savedBuyerData))
      } else {
        router.push(`/vendor/event/${id}/buy`)
      }

      fetchEventData(id)
      fetchTicketData(id)
      fetchPaymentMethods()
    }
  }, [pathname, dispatch, router])

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

  const fetchTicketData = async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/entrada/${id}`)
      const data = await response.json()
      if (data.success) {
        const processedTickets = processTicketData(data.data)
        setTicketTypes(processedTickets)
        dispatch(setTicketData(processedTickets))
      }
    } catch (error) {
      console.error("Error fetching ticket data:", error)
    } finally {
      setLoading(false)
    }
  }

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

    const detalles = Object.entries(tickets)
      .filter(([_, cantidad]) => cantidad > 0)
      .map(([ticketId, cantidad]) => {
        const ticketInfo = ticketTypes.find((t) => t.id === ticketId)
        if (ticketInfo?.isSubtype && ticketInfo?.parentId) {
          return {
            entradaId: ticketInfo.parentId,
            subtipoEntradaId: ticketId,
            cantidad,
            precio_unitario: Number.parseFloat(ticketInfo?.precio || 0),
          }
        } else {
          return {
            entradaId: ticketId,
            cantidad,
            precio_unitario: Number.parseFloat(ticketInfo?.precio || 0),
          }
        }
      })

    const total_final =
      selectedInstallment && taxCalculation.taxAmount > 0
        ? taxCalculation.finalTotal
        : subtotal

    return {
      userId: userId,
      estado: "pendiente",
      dni_cliente: buyerData.dni,
      nombre_cliente: buyerData.name,
      email_cliente: buyerData.email,
      telefono_cliente: buyerData.whatsapp,
      detalles,
      metodoDeCobroId: selectedPaymentMethod || null,
      taxPercentage: taxCalculation.taxPercentage,
      installments: taxCalculation.installments,
      total_final,
    }
  }

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

  const proceedToOrder = () => {
    if (!selectedPaymentMethod) {
      alert("Por favor selecciona un método de pago antes de continuar")
      return
    }

    if (
      currentPaymentMethodData &&
      Object.keys(currentPaymentMethodData.impuesto || {}).length > 1 &&
      !selectedInstallment
    ) {
      alert("Por favor selecciona el tipo de pago (cuotas) antes de continuar")
      return
    }

    submitOrder()
  }

  const closeSummary = () => {
    setShowSummary(false)
  }

  const handlePaymentSuccess = () => {
    dispatch(resetTickets())

    const pathSegments = pathname.split("/")
    const id = pathSegments[pathSegments.length - 1]
    fetchTicketData(id)

    setShowSummary(false)
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center p-4">
        <div className="w-full max-w-6xl animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="h-64 bg-gray-700 rounded-lg"></div>
              <div className="h-8 w-3/4 bg-gray-700 rounded"></div>
              <div className="h-4 w-1/2 bg-gray-700 rounded"></div>
            </div>
            <div className="space-y-4">
              <div className="h-12 bg-gray-700 rounded"></div>
              <div className="h-12 bg-gray-700 rounded"></div>
              <div className="h-12 bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

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
    <div className="flex min-h-screen w-full items-start justify-center p-4 lg:p-6">
      <div className="w-full max-w-6xl">
        {/* Layout de dos columnas en desktop, una columna en mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* COLUMNA IZQUIERDA: Información del evento y comprador */}
          <div className="space-y-4">
            {/* Datos del graduado */}
            {buyerData && (
              <div className="p-4 rounded-md border border-[#BF8D6B] bg-[#2D3443]/70">
                <h3 className="text-white text-sm font-medium mb-3">Datos del Graduado</h3>
                <div className="grid grid-cols-2 gap-3 text-xs text-[#EDEEF0]">
                  <div>
                    <p className="text-gray-400 mb-1">Nombre:</p>
                    <p className="font-medium">{buyerData.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">DNI:</p>
                    <p className="font-medium">{buyerData.dni}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">WhatsApp:</p>
                    <p className="font-medium">{buyerData.whatsapp}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">Email:</p>
                    <p className="font-medium truncate">{buyerData.email}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Imagen del evento */}
            <div className="rounded-lg overflow-hidden border border-[#BF8D6B]">
              <img
                src={eventData?.image || "/placeholder.svg?height=300&width=400&query=event" || "/placeholder.svg"}
                alt={eventData?.nombre || "Evento"}
                className="w-full h-64 lg:h-80 object-cover"
              />
            </div>

            {/* Información del evento */}
            <div className="p-4 rounded-md border border-[#BF8D6B] bg-[#2D3443]/70">
              <h1 className="text-2xl font-bold text-white mb-2">{eventData?.nombre || "Cargando evento..."}</h1>
              <p className="text-sm text-[#EDEEF0] mb-1 flex items-center gap-2">
                <span className="text-[#BF8D6B]">📍</span>
                {eventData?.lugar || "Área Eventos"}
              </p>
              <p className="text-sm text-[#EDEEF0] flex items-center gap-2">
                <span className="text-[#BF8D6B]">📅</span>
                {eventData?.fecha || "Fecha por confirmar"}
              </p>
            </div>
          </div>

          {/* COLUMNA DERECHA: Selección de entradas y pago */}
          <div className="space-y-4">
            {/* Selección de entradas con scroll si es muy largo */}
            <div className="p-4 rounded-md border border-[#BF8D6B] bg-[#2D3443]/70">
              <h3 className="text-white text-lg font-semibold mb-4">Seleccionar Entradas</h3>
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {ticketTypes.map((ticket) => {
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
                      <div className="flex-1 min-w-0 mr-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-sm font-medium ${isTicketSoldOut ? "text-gray-500" : "text-[#EDEEF0]"}`}>
                            {ticket.tipo_entrada}
                          </span>
                          {isTicketSoldOut && (
                            <span className="px-2 py-0.5 text-xs bg-red-900/50 text-red-300 rounded-full border border-red-700">
                              AGOTADO
                            </span>
                          )}
                        </div>
                        <p className={`text-sm font-semibold ${isTicketSoldOut ? "text-gray-600" : "text-[#BF8D6B]"}`}>
                          ${Number.parseFloat(ticket.precio).toLocaleString()}
                        </p>
                        <p className={`text-xs ${isTicketSoldOut ? "text-gray-600" : "text-gray-400"}`}>
                          Disponibles: {ticket.cantidad}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateTicketCount(ticket.id, -1)}
                          disabled={!canDecrement}
                          className={`w-8 h-8 flex items-center justify-center rounded-md font-bold text-lg transition-all duration-200 ${
                            canDecrement
                              ? "text-white bg-[#2D3443] border border-[#BF8D6B] hover:bg-[#BF8D6B]/20"
                              : "text-gray-600 bg-gray-800 border border-gray-600 cursor-not-allowed"
                          }`}
                          aria-label="Disminuir cantidad"
                        >
                          −
                        </button>
                        <span className={`w-8 text-center font-semibold ${isTicketSoldOut ? "text-gray-500" : "text-white"}`}>
                          {currentTicketCount}
                        </span>
                        <button
                          onClick={() => updateTicketCount(ticket.id, 1)}
                          disabled={!canIncrement}
                          className={`w-8 h-8 flex items-center justify-center rounded-md font-bold text-lg transition-all duration-200 ${
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
                  <div className="p-4 rounded-md border border-[#BF8D6B] text-center text-[#EDEEF0]">
                    No hay entradas disponibles para este evento
                  </div>
                )}
              </div>
            </div>

            {/* Método de pago */}
            <div className="p-4 rounded-md border border-[#BF8D6B] bg-[#2D3443]/70">
              <div className="flex items-center mb-3">
                <CreditCard className="h-5 w-5 mr-2 text-[#BF8D6B]" />
                <h3 className="text-white text-lg font-semibold">Método de Pago</h3>
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
                    className="w-full p-3 bg-[#2D3443] border border-[#BF8D6B] rounded-md text-[#EDEEF0] focus:outline-none focus:ring-2 focus:ring-[#BF8D6B] text-sm mb-3"
                  >
                    <option value="">Seleccionar método de pago</option>
                    {paymentMethods.map((method) => (
                      <option key={method.Id} value={method.Id}>
                        {method.tipo_de_cobro}
                      </option>
                    ))}
                  </select>

                  {currentPaymentMethodData &&
                    currentPaymentMethodData.impuesto &&
                    Object.keys(currentPaymentMethodData.impuesto).length > 0 && (
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-[#EDEEF0] mb-2">Tipo de Pago</label>
                        <select
                          value={selectedInstallment}
                          onChange={(e) => handleInstallmentChange(e.target.value)}
                          className="w-full p-3 bg-[#2D3443] border border-[#BF8D6B] rounded-md text-[#EDEEF0] focus:outline-none focus:ring-2 focus:ring-[#BF8D6B] text-sm"
                        >
                          <option value="">Seleccionar cuotas</option>
                          {Object.entries(currentPaymentMethodData.impuesto).map(([installments, taxRate]) => (
                            <option key={installments} value={installments}>
                              {installments === "1" ? "1 pago" : `${installments} cuotas`}
                              {taxRate > 0 && ` (+${taxRate}% impuesto)`}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                  {selectedPaymentMethod && selectedInstallment && (
                    <div className="mt-3 p-3 bg-blue-900/30 border border-blue-700 rounded-md">
                      <h4 className="font-medium text-blue-300 mb-1 text-sm">
                        ✓ {taxCalculation.methodName} -{" "}
                        {taxCalculation.installments === 1 ? "1 pago" : `${taxCalculation.installments} cuotas`}
                      </h4>
                      {taxCalculation.taxPercentage > 0 && (
                        <p className="text-xs text-blue-400">
                          Se aplicará un impuesto del {taxCalculation.taxPercentage}% sobre el total
                        </p>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Resumen de costos */}
            <div className="p-4 rounded-md border border-dashed border-[#BF8D6B] bg-[#2D3443]/50">
              <div className="flex justify-between mb-2 text-sm">
                <span className="text-[#EDEEF0]">Subtotal</span>
                <span className="text-white font-medium">${subtotal.toLocaleString()}</span>
              </div>
              {selectedInstallment && taxCalculation.taxAmount > 0 && (
                <>
                  <div className="flex justify-between text-orange-400 mb-2 text-sm">
                    <span>
                      + Impuesto {taxCalculation.methodName} ({taxCalculation.taxPercentage}%)
                    </span>
                    <span className="font-medium">+${taxCalculation.taxAmount.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-gray-600 pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="text-[#EDEEF0] font-semibold">Total con impuestos</span>
                      <span className="text-orange-400 font-bold text-lg">${taxCalculation.finalTotal.toLocaleString()}</span>
                    </div>
                  </div>
                </>
              )}
              {(!selectedInstallment || taxCalculation.taxAmount === 0) && (
                <div className="border-t border-gray-600 pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="text-[#EDEEF0] font-semibold">Total</span>
                    <span className="text-white font-bold text-lg">${subtotal.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Total final prominente */}
            <div className="flex justify-between items-center p-4 rounded-md bg-[#EDEEF0] border-2 border-[#BF8D6B]">
              <span className="font-bold text-[#202020] text-lg">Total a pagar</span>
              <span className="font-bold text-[#202020] text-2xl">
                $
                {selectedInstallment && taxCalculation.taxAmount > 0
                  ? taxCalculation.finalTotal.toLocaleString()
                  : subtotal.toLocaleString()}
              </span>
            </div>

            {/* Botón de orden de compra */}
            <button
              onClick={proceedToOrder}
              disabled={
                Object.values(tickets).every((count) => count === 0) ||
                isSubmitting ||
                !selectedPaymentMethod ||
                (currentPaymentMethodData &&
                  Object.keys(currentPaymentMethodData.impuesto || {}).length > 1 &&
                  !selectedInstallment)
              }
              className={`w-full rounded-md py-4 font-semibold text-white text-lg transition-all duration-200 ${
                Object.values(tickets).every((count) => count === 0) ||
                isSubmitting ||
                !selectedPaymentMethod ||
                (
                  currentPaymentMethodData &&
                    Object.keys(currentPaymentMethodData.impuesto || {}).length > 1 &&
                    !selectedInstallment
                )
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-[#BF8D6B] hover:bg-[#A67A5C]"
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
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
              ) : currentPaymentMethodData &&
                Object.keys(currentPaymentMethodData.impuesto || {}).length > 1 &&
                !selectedInstallment ? (
                "Selecciona tipo de pago"
              ) : (
                "Orden de compra"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Modal de resumen */}
      <OrdenCompraModal
        isOpen={showSummary}
        onClose={closeSummary}
        buyerData={buyerData}
        eventData={eventData}
        selectedTickets={selectedTickets}
        subtotal={subtotal}
        total={selectedInstallment && taxCalculation.taxAmount > 0 ? taxCalculation.finalTotal : subtotal}
        orderSuccess={orderSuccess}
        orderError={orderError}
        orderId={orderId}
        selectedPaymentMethod={selectedPaymentMethod}
        paymentMethodName={taxCalculation.methodName}
        taxDetails={taxCalculation}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* Estilos para el scrollbar personalizado */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(45, 52, 67, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #BF8D6B;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #A67A5C;
        }
      `}</style>
    </div>
  )
}