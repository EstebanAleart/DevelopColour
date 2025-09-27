"use client"

import { useState, useEffect } from "react"
import { X, Plus, Minus, Calculator } from "lucide-react"
import Swal from "sweetalert2"
import apiUrls from "@/app/components/utils/apiConfig"

const API_URL = apiUrls

export default function NotaDebitoModal({ orden, onClose, onSuccess }) {
  const [entradas, setEntradas] = useState([])
  const [metodosPago, setMetodosPago] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Estado para los cambios
  const [selectedEntrada, setSelectedEntrada] = useState("")
  const [selectedSubtipo, setSelectedSubtipo] = useState("")
  const [itemsAQuitar, setItemsAQuitar] = useState([])
  const [itemsAAgregar, setItemsAAgregar] = useState([])
  const [cuotasSeleccionadas, setCuotasSeleccionadas] = useState(1)
  const [metodoSeleccionado, setMetodoSeleccionado] = useState("")

  // Calcular totales
  const totalAQuitar = itemsAQuitar.reduce((sum, item) => sum + item.cantidad * item.precio_unitario, 0)
  const totalAAgregar = itemsAAgregar.reduce((sum, item) => sum + item.cantidad * item.precio_unitario, 0)
  const diferencia = totalAAgregar - totalAQuitar

  // Calcular impuestos
  const metodoActual = metodosPago.find((m) => m.Id === metodoSeleccionado)
  const impuestoPorcentaje = metodoActual?.impuesto[cuotasSeleccionadas.toString()] || 0
  const impuesto = diferencia * (impuestoPorcentaje / 100)
  const totalFinal = diferencia + impuesto

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      console.log("[v0] Fetching data for orden:", orden)

      let eventoId = null
      if (orden.DetalleDeOrdens && orden.DetalleDeOrdens.length > 0) {
        eventoId = orden.DetalleDeOrdens[0].Entrada?.eventoId
      }

      console.log("[v0] Extracted eventoId:", eventoId)

      if (!eventoId) {
        throw new Error("No se pudo obtener el ID del evento de la orden")
      }

      // Obtener entradas del evento
      const entradasResponse = await fetch(`${API_URL}/api/entrada/${eventoId}`)
      console.log("[v0] Entradas response status:", entradasResponse.status)

      if (!entradasResponse.ok) {
        throw new Error(`Error fetching entradas: ${entradasResponse.status}`)
      }

      const entradasData = await entradasResponse.json()
      console.log("[v0] Entradas data received:", entradasData)

      // Obtener métodos de pago
      const metodosResponse = await fetch(`${API_URL}/api/paymentMethod`)
      console.log("[v0] Metodos response status:", metodosResponse.status)

      if (!metodosResponse.ok) {
        throw new Error(`Error fetching payment methods: ${metodosResponse.status}`)
      }

      const metodosData = await metodosResponse.json()
      console.log("[v0] Metodos data received:", metodosData)

      if (entradasData.success && entradasData.data) {
        setEntradas(entradasData.data)
        console.log("[v0] Entradas set:", entradasData.data)
      } else {
        console.error("[v0] No entradas data or success false:", entradasData)
      }

      if (metodosData.data) {
        setMetodosPago(metodosData.data)
        console.log("[v0] Metodos set:", metodosData.data)
        // Preseleccionar el método de pago actual
        if (orden.Pagos && orden.Pagos.length > 0) {
          setMetodoSeleccionado(orden.Pagos[0].metodoDeCobroId)
          setCuotasSeleccionadas(orden.Pagos[0].cuotas)
          console.log("[v0] Preselected payment method:", orden.Pagos[0].metodoDeCobroId)
        }
      } else {
        console.error("[v0] No metodos data:", metodosData)
      }
    } catch (error) {
      console.error("[v0] Error fetching data:", error)
      Swal.fire({
        title: "Error",
        text: `No se pudieron cargar los datos necesarios: ${error.message}`,
        icon: "error",
        confirmButtonColor: "#BF8D6B",
        background: "#1F2937",
        color: "#E5E7EB",
      })
    } finally {
      setLoading(false)
    }
  }

  const agregarItemAQuitar = () => {
    if (!selectedSubtipo) {
      console.log("[v0] No subtipo selected for quitar")
      return
    }

    console.log("[v0] Adding item to quitar:", selectedSubtipo)
    const precio = obtenerSubtipoPrecio(selectedSubtipo)

    setItemsAQuitar([
      ...itemsAQuitar,
      {
        subtipoId: selectedSubtipo,
        cantidad: 1,
        precio_unitario: precio,
      },
    ])
  }

  const agregarItemAAgregar = () => {
    if (!selectedSubtipo) {
      console.log("[v0] No subtipo selected for agregar")
      return
    }

    console.log("[v0] Adding item to agregar:", selectedSubtipo)
    const precio = obtenerSubtipoPrecio(selectedSubtipo)

    setItemsAAgregar([
      ...itemsAAgregar,
      {
        subtipoId: selectedSubtipo,
        cantidad: 1,
        precio_unitario: precio,
      },
    ])
  }

  const actualizarItemAQuitar = (index, field, value) => {
    const nuevosItems = [...itemsAQuitar]
    nuevosItems[index] = { ...nuevosItems[index], [field]: value }
    setItemsAQuitar(nuevosItems)
  }

  const actualizarItemAAgregar = (index, field, value) => {
    const nuevosItems = [...itemsAAgregar]
    nuevosItems[index] = { ...nuevosItems[index], [field]: value }
    setItemsAAgregar(nuevosItems)
  }

  const eliminarItemAQuitar = (index) => {
    setItemsAQuitar(itemsAQuitar.filter((_, i) => i !== index))
  }

  const eliminarItemAAgregar = (index) => {
    setItemsAAgregar(itemsAAgregar.filter((_, i) => i !== index))
  }

  const obtenerSubtipoNombre = (subtipoId) => {
    console.log("[v0] Looking for subtipo name:", subtipoId, "in entradas:", entradas)
    for (const entrada of entradas) {
      if (entrada.subtipos && Array.isArray(entrada.subtipos)) {
        const subtipo = entrada.subtipos.find((s) => s.id === subtipoId)
        if (subtipo) {
          return `${entrada.tipo_entrada} - ${subtipo.nombre}`
        }
      }
    }
    return "Subtipo no encontrado"
  }

  const obtenerSubtipoPrecio = (subtipoId) => {
    console.log("[v0] Looking for subtipo price:", subtipoId)
    for (const entrada of entradas) {
      if (entrada.subtipos && Array.isArray(entrada.subtipos)) {
        const subtipo = entrada.subtipos.find((s) => s.id === subtipoId)
        if (subtipo) {
          const precio = Number.parseFloat(subtipo.precio)
          console.log("[v0] Found price:", precio)
          return precio
        }
      }
    }
    console.log("[v0] Price not found, returning 0")
    return 0
  }

  const procesarNotaDebito = async () => {
    if (itemsAQuitar.length === 0 && itemsAAgregar.length === 0) {
      Swal.fire({
        title: "Error",
        text: "Debe agregar al menos un cambio",
        icon: "error",
        confirmButtonColor: "#BF8D6B",
        background: "#1F2937",
        color: "#E5E7EB",
      })
      return
    }

    if (!metodoSeleccionado || !selectedEntrada) {
      Swal.fire({
        title: "Error",
        text: "Debe seleccionar un método de pago y una entrada",
        icon: "error",
        confirmButtonColor: "#BF8D6B",
        background: "#1F2937",
        color: "#E5E7EB",
      })
      return
    }

    try {
      setSubmitting(true)

      const payload = {
        pagoId: orden.Pagos && orden.Pagos.length > 0 ? orden.Pagos[0].id : null,
        ordenId: orden.id,
        metodoDeCobroId: metodoSeleccionado,
        cuotas: cuotasSeleccionadas,
        cambios: [
          {
            entradaId: selectedEntrada, 
            quitar: itemsAQuitar,
            agregar: itemsAAgregar,
          },
        ],
      }

      console.log("[v0] Sending payload:", payload)

      const response = await fetch(`${API_URL}/api/nota`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })
      
      const data = await response.json()
      console.log("[v0] Response data:", data)

      if (response.ok) {
        Swal.fire({
          title: "¡Éxito!",
          text: "Nota de débito procesada correctamente",
          icon: "success",
          confirmButtonColor: "#BF8D6B",
          background: "#1F2937",
          color: "#E5E7EB",
        })
        onSuccess()
        onClose()
      } else {
        throw new Error(data.message || "Error al procesar la nota de débito")
      }
    } catch (error) {
      console.error("[v0] Error processing debit note:", error)
      Swal.fire({
        title: "Error",
        text: error instanceof Error ? error.message : "Error al procesar la nota de débito",
        icon: "error",
        confirmButtonColor: "#BF8D6B",
        background: "#1F2937",
        color: "#E5E7EB",
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#BF8D6B]"></div>
            <p className="ml-3 text-white">Cargando datos...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-800 border-b border-[#BF8D6B] p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Nota de Débito</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Información de la orden */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-2">Información de la Orden</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-[#BF8D6B]">ID Orden:</span>
                <span className="text-white ml-2">{orden.id}</span>
              </div>
              <div>
                <span className="text-[#BF8D6B]">Total Original:</span>
                <span className="text-white ml-2">${Number.parseFloat(orden.total).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Debug info */}
          {entradas.length === 0 && (
            <div className="bg-yellow-900/20 border border-yellow-600 rounded-lg p-4">
              <p className="text-yellow-300 text-sm">
                ⚠️ No se encontraron entradas para el evento. Verificando evento ID: {orden.eventoId}
              </p>
            </div>
          )}

          {/* Selección de entrada y subtipo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#BF8D6B] text-sm font-medium mb-2">
                Seleccionar Entrada ({entradas.length} disponibles)
              </label>
              <select
                value={selectedEntrada}
                onChange={(e) => {
                  console.log("[v0] Selected entrada changed to:", e.target.value)
                  setSelectedEntrada(e.target.value)
                  setSelectedSubtipo("") // Reset subtipo when entrada changes
                }}
                className="w-full p-3 bg-gray-700 text-white rounded border border-[#BF8D6B] text-sm"
              >
                <option value="">Seleccione una entrada</option>
                {entradas.map((entrada) => (
                  <option key={entrada.id} value={entrada.id}>
                    {entrada.tipo_entrada} ({entrada.subtipos?.length || 0} subtipos)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[#BF8D6B] text-sm font-medium mb-2">Seleccionar Subtipo</label>
              <select
                value={selectedSubtipo}
                onChange={(e) => {
                  console.log("[v0] Selected subtipo changed to:", e.target.value)
                  setSelectedSubtipo(e.target.value)
                }}
                disabled={!selectedEntrada}
                className="w-full p-3 bg-gray-700 text-white rounded border border-[#BF8D6B] text-sm disabled:opacity-50"
              >
                <option value="">Seleccione un subtipo</option>
                {selectedEntrada &&
                  entradas
                    .find((e) => e.id === selectedEntrada)
                    ?.subtipos?.map((subtipo) => (
                      <option key={subtipo.id} value={subtipo.id}>
                        {subtipo.nombre} - ${Number.parseFloat(subtipo.precio).toLocaleString()}
                      </option>
                    ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Items a quitar */}
            <div className="bg-red-900/20 rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-red-300">Items a Quitar</h3>
                <button
                  onClick={agregarItemAQuitar}
                  disabled={!selectedSubtipo}
                  className="px-3 py-1 bg-red-600 text-white rounded text-sm flex items-center gap-1 disabled:opacity-50"
                >
                  <Minus className="h-4 w-4" />
                  Agregar
                </button>
              </div>

              <div className="space-y-3">
                {itemsAQuitar.map((item, index) => (
                  <div key={index} className="bg-gray-700 rounded p-3">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-white text-sm">{obtenerSubtipoNombre(item.subtipoId)}</span>
                      <button onClick={() => eliminarItemAQuitar(index)} className="text-red-400 hover:text-red-300">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Cantidad</label>
                        <input
                          type="number"
                          min="1"
                          value={item.cantidad}
                          onChange={(e) => actualizarItemAQuitar(index, "cantidad", Number.parseInt(e.target.value))}
                          className="w-full p-2 bg-gray-600 text-white rounded text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Precio Unitario</label>
                        <input
                          type="number"
                          step="0.01"
                          value={item.precio_unitario || obtenerSubtipoPrecio(item.subtipoId)}
                          onChange={(e) =>
                            actualizarItemAQuitar(index, "precio_unitario", Number.parseFloat(e.target.value))
                          }
                          className="w-full p-2 bg-gray-600 text-white rounded text-sm"
                        />
                      </div>
                    </div>
                    <div className="mt-2 text-right">
                      <span className="text-red-300 font-medium">
                        Subtotal: $
                        {(
                          (item.precio_unitario || obtenerSubtipoPrecio(item.subtipoId)) * item.cantidad
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Items a agregar */}
            <div className="bg-green-900/20 rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-green-300">Items a Agregar</h3>
                <button
                  onClick={agregarItemAAgregar}
                  disabled={!selectedSubtipo}
                  className="px-3 py-1 bg-green-600 text-white rounded text-sm flex items-center gap-1 disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" />
                  Agregar
                </button>
              </div>

              <div className="space-y-3">
                {itemsAAgregar.map((item, index) => (
                  <div key={index} className="bg-gray-700 rounded p-3">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-white text-sm">{obtenerSubtipoNombre(item.subtipoId)}</span>
                      <button onClick={() => eliminarItemAAgregar(index)} className="text-red-400 hover:text-red-300">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Cantidad</label>
                        <input
                          type="number"
                          min="1"
                          value={item.cantidad}
                          onChange={(e) => actualizarItemAAgregar(index, "cantidad", Number.parseInt(e.target.value))}
                          className="w-full p-2 bg-gray-600 text-white rounded text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Precio Unitario</label>
                        <input
                          type="number"
                          step="0.01"
                          value={item.precio_unitario || obtenerSubtipoPrecio(item.subtipoId)}
                          onChange={(e) =>
                            actualizarItemAAgregar(index, "precio_unitario", Number.parseFloat(e.target.value))
                          }
                          className="w-full p-2 bg-gray-600 text-white rounded text-sm"
                        />
                      </div>
                    </div>
                    <div className="mt-2 text-right">
                      <span className="text-green-300 font-medium">
                        Subtotal: $
                        {(
                          (item.precio_unitario || obtenerSubtipoPrecio(item.subtipoId)) * item.cantidad
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Método de pago y cuotas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#BF8D6B] text-sm font-medium mb-2">Método de Pago</label>
              <select
                value={metodoSeleccionado}
                onChange={(e) => setMetodoSeleccionado(e.target.value)}
                className="w-full p-3 bg-gray-700 text-white rounded border border-[#BF8D6B] text-sm"
              >
                <option value="">Seleccione método de pago</option>
                {metodosPago.map((metodo) => (
                  <option key={metodo.Id} value={metodo.Id}>
                    {metodo.tipo_de_cobro}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[#BF8D6B] text-sm font-medium mb-2">Cuotas</label>
              <select
                value={cuotasSeleccionadas}
                onChange={(e) => setCuotasSeleccionadas(Number.parseInt(e.target.value))}
                className="w-full p-3 bg-gray-700 text-white rounded border border-[#BF8D6B] text-sm"
              >
                {metodoActual &&
                  Object.keys(metodoActual.impuesto).map((cuota) => (
                    <option key={cuota} value={cuota}>
                      {cuota} cuota{cuota !== "1" ? "s" : ""} ({metodoActual.impuesto[cuota]}% interés)
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Resumen de cálculos */}
          <div className="bg-[#BF8D6B]/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Calculator className="h-5 w-5 text-[#BF8D6B]" />
              <h3 className="text-lg font-semibold text-white">Resumen de Cambios</h3>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-300">Total a quitar:</span>
                <span className="text-red-300">-${totalAQuitar.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Total a agregar:</span>
                <span className="text-green-300">+${totalAAgregar.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t border-gray-600 pt-2">
                <span className="text-gray-300">Diferencia:</span>
                <span className={diferencia >= 0 ? "text-green-300" : "text-red-300"}>
                  {diferencia >= 0 ? "+" : ""}${diferencia.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Impuesto ({impuestoPorcentaje}%):</span>
                <span className="text-yellow-300">${impuesto.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t border-gray-600 pt-2 font-bold">
                <span className="text-white">Total a pagar:</span>
                <span className="text-[#BF8D6B] text-lg">${totalFinal.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-600">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={procesarNotaDebito}
              disabled={submitting || (itemsAQuitar.length === 0 && itemsAAgregar.length === 0)}
              className="px-4 py-2 bg-[#BF8D6B] text-white rounded hover:bg-[#a67454] transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {submitting && (
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
              )}
              {submitting ? "Procesando..." : "Procesar Nota de Débito"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
