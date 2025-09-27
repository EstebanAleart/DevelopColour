"use client"

import { useState, useEffect, useMemo } from "react"
import { Search, Download, Eye, Trash, ChevronDown, ChevronUp, X, Calculator } from "lucide-react"
import Swal from "sweetalert2"
import Header from "../components/header"
import OrdenDetalleModal from "@/app/components/entradas/ordenDetalleModal"
import apiUrls from "@/app/components/utils/apiConfig"
import useUserRoleFromLocalStorage from "@/app/components/hook/userRoleFromLocalstorage"
import { downloadCSV } from "@/app/components/utils/csvExporter"
import NotaDebitoModal from "@/app/components/notadebitoModal"

const API_URL = apiUrls

const getMetodoDePago = (orden) => {
  if (orden.Pagos && orden.Pagos.length > 0 && orden.Pagos[0].MetodoDePago) {
    return orden.Pagos[0].MetodoDePago.tipo_de_cobro
  }
  return "N/A"
}

const getCuotas = (orden) => {
  if (orden.Pagos && orden.Pagos.length > 0 && orden.Pagos[0].cuotas) {
    return orden.Pagos[0].cuotas + " cuotas"
  }
  return "1 cuota"
}

export default function OrdenesYPagos() {
  const { userRole, userId } = useUserRoleFromLocalStorage()
  const [ordenes, setOrdenes] = useState([])
  const [allOrdersForSummary, setAllOrdersForSummary] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedOrden, setSelectedOrden] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalOrdenesCount, setTotalOrdenesCount] = useState(0)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [orderBy, setOrderBy] = useState("fecha_creacion")
  const [orderDirection, setOrderDirection] = useState("DESC")
  const [expandedMobileItems, setExpandedMobileItems] = useState(new Set())
  const [showNotaDebitoModal, setShowNotaDebitoModal] = useState(false)
  const [selectedOrdenForNota, setSelectedOrdenForNota] = useState(null)

  const limit = 5

  const [filters, setFilters] = useState({
    evento: "",
    estado: "",
    salon: "",
    fechaDesde: "",
    fechaHasta: "",
    metodoDePago: "",
    cuotas: "",
  })

  const buildApiUrl = (basePath, currentLimit, currentOffset) => {
    const queryParams = new URLSearchParams()
    queryParams.append("limit", currentLimit.toString())
    queryParams.append("offset", currentOffset.toString())

    if (userRole === "vendor" && userId) {
      queryParams.append("userId", userId)
    }
    if (filters.evento) {
      queryParams.append("evento", filters.evento)
    }
    if (filters.estado) {
      queryParams.append("estado", filters.estado)
    }
    if (filters.salon) {
      queryParams.append("salon", filters.salon)
    }
    if (filters.fechaDesde) {
      queryParams.append("fechaDesde", filters.fechaDesde)
    }
    if (filters.fechaHasta) {
      queryParams.append("fechaHasta", filters.fechaHasta)
    }
    if (filters.metodoDePago) {
      queryParams.append("metodoDePago", filters.metodoDePago)
    }
    if (filters.cuotas) {
      queryParams.append("cuotas", filters.cuotas)
    }

    queryParams.append("orderBy", orderBy)
    queryParams.append("orderDirection", orderDirection)

    return basePath + "/api/order?" + queryParams.toString()
  }

  const getEventoNombre = (orden) => {
    if (orden.DetalleDeOrdens && orden.DetalleDeOrdens.length > 0) {
      const detalle = orden.DetalleDeOrdens[0]
      if (detalle && detalle.Entrada && detalle.Entrada.Evento && detalle.Entrada.Evento.nombre) {
        return detalle.Entrada.Evento.nombre
      }
    }
    return "Sin evento"
  }

  const formatFecha = (fecha) => {
    if (!fecha) return "Sin fecha"
    const date = new Date(fecha)
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const formatMonto = (monto) => {
    const amount = Number.parseFloat(monto || 0)
    return (
      "$" +
      amount.toLocaleString("es-ES", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    )
  }

  const getRealOrderTotal = (orden) => {
    if (orden.Pagos && orden.Pagos.length > 0) {
      return orden.Pagos[0].total
    }
    return orden.total
  }

  const getEstadoBadge = (estado) => {
    if (estado === "pagado") {
      return (
        <span className="px-2 py-1 rounded-full text-xs border bg-green-800 text-green-200 border-green-600">
          Pagado
        </span>
      )
    }

    if (estado === "pendiente") {
      return (
        <span className="px-2 py-1 rounded-full text-xs border bg-orange-800 text-orange-200 border-gray-700">
          Pendiente
        </span>
      )
    }

    if (estado === "cancelado") {
      return (
        <span className="px-2 py-1 rounded-full text-xs border bg-red-800 text-red-200 border-red-600">Cancelado</span>
      )
    }

    return (
      <span className="px-2 py-1 rounded-full text-xs border bg-blue-800 text-blue-200 border-blue-600">{estado}</span>
    )
  }

  const handleRowClick = (orden) => {
    setSelectedOrden(orden)
    setShowModal(true)
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handleSort = (field) => {
    const allowedSortFields = ["fecha_creacion", "estado", "total", "nombre_cliente", "email_cliente"]
    if (!allowedSortFields.includes(field)) {
      console.warn("Sorting by field " + field + " is not allowed by the backend.")
      return
    }

    if (orderBy === field) {
      setOrderDirection(orderDirection === "ASC" ? "DESC" : "ASC")
    } else {
      setOrderBy(field)
      setOrderDirection("DESC")
    }
    setCurrentPage(1)
  }

  const clearAllFilters = () => {
    setFilters({
      evento: "",
      estado: "",
      salon: "",
      fechaDesde: "",
      fechaHasta: "",
      metodoDePago: "",
      cuotas: "",
    })
    setCurrentPage(1)
  }

  const fetchPaginatedOrdenes = async (page) => {
    if (page === undefined) page = 1
    if (userRole === null) return

    try {
      setLoading(true)
      setError(null)
      const offset = (page - 1) * limit
      const url = buildApiUrl(API_URL, limit, offset)

      const response = await fetch(url)
      const data = await response.json()

      if (data.success) {
        setOrdenes(data.data.ordenes || [])
        const total = data.data.pagination ? data.data.pagination.total : 0
        setTotalOrdenesCount(total)
        setTotalPages(Math.ceil(total / limit))
      } else {
        setError("Error al cargar las ordenes: " + (data.message || "Desconocido"))
      }
    } catch (err) {
      setError("Error de conexion al cargar ordenes.")
      console.error("Error fetching paginated orders:", err)
    } finally {
      setLoading(false)
    }
  }

  const fetchAllOrdersForSummary = async () => {
    if (userRole === null) return

    try {
      const url = buildApiUrl(API_URL, 10000, 0)
      const response = await fetch(url)
      const data = await response.json()

      if (data.success) {
        setAllOrdersForSummary(data.data.ordenes || [])
      } else {
        console.error("Error fetching all orders for summary:", data.message)
      }
    } catch (err) {
      console.error("Connection error fetching all orders for summary:", err)
    }
  }

  const handleDeleteOrder = async (orderId, event) => {
    event.stopPropagation()

    const result = await Swal.fire({
      title: "Estas seguro?",
      text: "No podras revertir esto!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#BF8D6B",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si, eliminar",
      cancelButtonText: "Cancelar",
      background: "#1F2937",
      color: "#E5E7EB",
    })

    if (result.isConfirmed) {
      try {
        const response = await fetch(API_URL + "/api/order/" + orderId, {
          method: "DELETE",
        })
        const data = await response.json()

        if (data.success) {
          Swal.fire({
            title: "Eliminada!",
            text: data.message,
            icon: "success",
            confirmButtonColor: "#BF8D6B",
            background: "#1F2937",
            color: "#E5E7EB",
          })
          fetchPaginatedOrdenes(currentPage)
          fetchAllOrdersForSummary()
        } else {
          Swal.fire({
            title: "Error",
            text: data.message || "No se pudo eliminar la orden.",
            icon: "error",
            confirmButtonColor: "#BF8D6B",
            background: "#1F2937",
            color: "#E5E7EB",
          })
        }
      } catch (err) {
        console.error("Error al eliminar la orden:", err)
        Swal.fire({
          title: "Error de conexion",
          text: "No se pudo conectar con el servidor para eliminar la orden.",
          icon: "error",
          confirmButtonColor: "#BF8D6B",
          background: "#1F2937",
          color: "#E5E7EB",
        })
      }
    }
  }

  const handleNotaDebito = (orden, event) => {
    event.stopPropagation()
    setSelectedOrdenForNota(orden)
    setShowNotaDebitoModal(true)
  }

  const handleNotaDebitoSuccess = () => {
    fetchPaginatedOrdenes(currentPage)
    fetchAllOrdersForSummary()
  }

  const summaryData = useMemo(() => {
    let totalOrders = 0
    let totalPaid = 0
    let totalPending = 0
    let paidCount = 0

    allOrdersForSummary.forEach((orden) => {
      const realTotal = Number.parseFloat(getRealOrderTotal(orden) || 0)
      totalOrders += realTotal
      if (orden.estado === "pagado") {
        totalPaid += realTotal
        paidCount++
      } else if (orden.estado === "pendiente") {
        totalPending += realTotal
      }
    })

    return {
      totalOrdersValue: totalOrders,
      totalPaidValue: totalPaid,
      totalPendingValue: totalPending,
      paidOrdersCount: paidCount,
    }
  }, [allOrdersForSummary])

  useEffect(() => {
    if (userRole !== null) {
      fetchPaginatedOrdenes(currentPage)
    }
  }, [currentPage, userRole, userId, filters, orderBy, orderDirection])

  useEffect(() => {
    if (userRole !== null) {
      fetchAllOrdersForSummary()
    }
  }, [userRole, userId, filters, orderBy, orderDirection])

  const toggleMobileItem = (ordenId, event) => {
    event.stopPropagation()
    const newExpanded = new Set(expandedMobileItems)
    if (newExpanded.has(ordenId)) {
      newExpanded.delete(ordenId)
    } else {
      newExpanded.add(ordenId)
    }
    setExpandedMobileItems(newExpanded)
  }

  if (loading && ordenes.length === 0) {
    return (
      <div className="p-4">
        <Header title="Ordenes y Pagos" />
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#BF8D6B]"></div>
        </div>
      </div>
    )
  }

  if (userRole === null) {
    return (
      <div className="p-4">
        <Header title="Ordenes y Pagos" />
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#BF8D6B]"></div>
          <p className="ml-3 text-gray-400 text-sm">Cargando datos de usuario...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4">
      <Header title="Ordenes y Pagos" />
      {error && (
        <div className="p-2 bg-red-900/50 text-red-300 text-xs rounded border border-red-700 mb-4">{error}</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <div className="bg-transparent border border-[#BF8D6B] rounded-lg p-3 text-center">
          <p className="text-[#BF8D6B] text-xs mb-1">Total Ordenes</p>
          <p className="text-lg font-bold text-white">{formatMonto(summaryData.totalOrdersValue)}</p>
          <p className="text-xs text-gray-400">{totalOrdenesCount} ordenes</p>
        </div>
        <div className="bg-transparent border border-[#BF8D6B] rounded-lg p-3 text-center">
          <p className="text-[#BF8D6B] text-xs mb-1">Total Pagado</p>
          <p className="text-lg font-bold text-green-400">{formatMonto(summaryData.totalPaidValue)}</p>
          <p className="text-xs text-gray-400">{summaryData.paidOrdersCount} pagos</p>
        </div>
        <div className="bg-transparent border border-[#BF8D6B] rounded-lg p-3 text-center">
          <p className="text-[#BF8D6B] text-xs mb-1">Por Cobrar</p>
          <p className="text-lg font-bold text-orange-400">{formatMonto(summaryData.totalPendingValue)}</p>
          <p className="text-xs text-gray-400">Por cobrar</p>
        </div>
      </div>

      <div className="bg-transparent rounded-lg border border-[#BF8D6B] p-3 mb-4">
        <div className="flex flex-wrap gap-2 justify-between items-center mb-3">
          <div className="relative w-full sm:w-1/4">
            <input
              type="text"
              placeholder="Buscar por evento"
              value={filters.evento}
              onChange={(e) => setFilters({ ...filters, evento: e.target.value })}
              className="w-full p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs pl-8"
            />
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-[#BF8D6B] h-3 w-3" />
          </div>
          <div className="relative w-full sm:w-1/4">
            <input
              type="text"
              placeholder="Buscar por salon"
              value={filters.salon}
              onChange={(e) => setFilters({ ...filters, salon: e.target.value })}
              className="w-full p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs pl-8"
            />
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-[#BF8D6B] h-3 w-3" />
          </div>
          <div className="w-full sm:w-1/4">
            <select
              value={filters.estado}
              onChange={(e) => setFilters({ ...filters, estado: e.target.value })}
              className="w-full p-2 bg-transparent text-white rounded border border-[#BF8D6B] text-xs"
            >
              <option value="">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="pagado">Pagado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="px-3 py-1 bg-transparent text-[#BF8D6B] border border-[#BF8D6B] rounded text-xs flex items-center gap-1 transition-colors"
            >
              Filtros Avanzados
              {showAdvancedFilters ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
          </div>
        </div>

        {showAdvancedFilters && (
          <div className="border-t border-[#BF8D6B] pt-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
              <div className="relative">
                <label className="block text-xs text-[#BF8D6B] mb-1">Fecha Desde</label>
                <input
                  type="date"
                  value={filters.fechaDesde}
                  onChange={(e) => setFilters({ ...filters, fechaDesde: e.target.value })}
                  className="w-full p-2 bg-transparent text-white rounded border border-[#BF8D6B] text-xs"
                />
              </div>
              <div className="relative">
                <label className="block text-xs text-[#BF8D6B] mb-1">Fecha Hasta</label>
                <input
                  type="date"
                  value={filters.fechaHasta}
                  onChange={(e) => setFilters({ ...filters, fechaHasta: e.target.value })}
                  className="w-full p-2 bg-transparent text-white rounded border border-[#BF8D6B] text-xs"
                />
              </div>
              <div className="relative">
                <label className="block text-xs text-[#BF8D6B] mb-1">Metodo de Pago</label>
                <input
                  type="text"
                  placeholder="Ej: Visa Santander, Mastercard"
                  value={filters.metodoDePago}
                  onChange={(e) => setFilters({ ...filters, metodoDePago: e.target.value })}
                  className="w-full p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs"
                />
              </div>
              <div className="relative">
                <label className="block text-xs text-[#BF8D6B] mb-1">Cuotas</label>
                <input
                  type="text"
                  placeholder="Ej: 1, 3, 6, 12"
                  value={filters.cuotas}
                  onChange={(e) => setFilters({ ...filters, cuotas: e.target.value })}
                  className="w-full p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={clearAllFilters}
                className="px-3 py-1 bg-transparent text-[#BF8D6B] border border-[#BF8D6B] rounded text-xs flex items-center gap-1 transition-colors"
              >
                <X className="h-3 w-3" />
                Limpiar Filtros
              </button>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={() =>
              downloadCSV(
                allOrdersForSummary,
                summaryData.totalOrdersValue,
                summaryData.totalPaidValue,
                summaryData.totalPendingValue,
                totalOrdenesCount,
                summaryData.paidOrdersCount,
              )
            }
            className="px-3 py-1 bg-[#BF8D6B] text-white rounded text-xs flex items-center gap-1 transition-colors"
          >
            <Download className="h-3 w-3" />
            Descargar CSV
          </button>
        </div>
      </div>

      <div className="bg-transparent rounded-lg border border-[#BF8D6B] overflow-hidden">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#BF8D6B]/20">
              <tr>
                <th className="px-3 py-2 text-left text-white font-medium text-xs">Vendedor</th>
                <th
                  className="px-3 py-2 text-left text-white font-medium text-xs cursor-pointer"
                  onClick={() => handleSort("nombre_cliente")}
                >
                  Cliente
                  {orderBy === "nombre_cliente" && <span>{orderDirection === "ASC" ? " ▲" : " ▼"}</span>}
                </th>
                <th className="px-3 py-2 text-left text-white font-medium text-xs">Evento</th>
                <th
                  className="px-3 py-2 text-left text-white font-medium text-xs cursor-pointer"
                  onClick={() => handleSort("fecha_creacion")}
                >
                  Fecha
                  {orderBy === "fecha_creacion" && <span>{orderDirection === "ASC" ? " ▲" : " ▼"}</span>}
                </th>
                <th
                  className="px-3 py-2 text-left text-white font-medium text-xs cursor-pointer"
                  onClick={() => handleSort("total")}
                >
                  Monto
                  {orderBy === "total" && <span>{orderDirection === "ASC" ? " ▲" : " ▼"}</span>}
                </th>
                <th className="px-3 py-2 text-left text-white font-medium text-xs">Método de Pago</th>
                <th className="px-3 py-2 text-left text-white font-medium text-xs">Cuotas</th>
                <th
                  className="px-3 py-2 text-left text-white font-medium text-xs cursor-pointer"
                  onClick={() => handleSort("estado")}
                >
                  Estado
                  {orderBy === "estado" && <span>{orderDirection === "ASC" ? " ▲" : " ▼"}</span>}
                </th>
                <th className="px-3 py-2 text-center text-white font-medium text-xs">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#BF8D6B]/20">
              {ordenes.map((orden) => (
                <tr
                  key={orden.id}
                  className="hover:bg-[#BF8D6B]/10 cursor-pointer transition-colors"
                  onClick={() => handleRowClick(orden)}
                >
                  <td className="px-3 py-2 text-gray-300 text-xs">
                    <div>
                      <div className="font-medium">{orden.User?.nombre || "N/A"}</div>
                      <div className="text-gray-500">{orden.User?.email || ""}</div>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-gray-300 text-xs">
                    <div>
                      <div className="font-medium">{orden.nombre_cliente}</div>
                      <div className="text-gray-500">{orden.email_cliente}</div>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-gray-300 text-xs">{getEventoNombre(orden)}</td>
                  <td className="px-3 py-2 text-gray-300 text-xs">{formatFecha(orden.fecha_creacion)}</td>
                  <td className="px-3 py-2 text-gray-300 font-medium text-xs">
                    {formatMonto(getRealOrderTotal(orden))}
                  </td>
                  <td className="px-3 py-2 text-gray-300 text-xs">{getMetodoDePago(orden)}</td>
                  <td className="px-3 py-2 text-gray-300 text-xs">{getCuotas(orden)}</td>
                  <td className="px-3 py-2 text-xs">{getEstadoBadge(orden.estado)}</td>
                  <td className="px-3 py-2 text-center flex items-center justify-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRowClick(orden)
                      }}
                      className="text-[#BF8D6B] hover:text-[#a67454] transition-colors p-1 rounded"
                      title="Ver detalles"
                    >
                      <Eye className="h-3 w-3" />
                    </button>
                    <button
                      onClick={(e) => handleNotaDebito(orden, e)}
                      className="text-blue-400 hover:text-blue-300 transition-colors p-1 rounded"
                      title="Nota de débito"
                    >
                      <Calculator className="h-3 w-3" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteOrder(orden.id, e)}
                      className="text-red-400 hover:text-red-300 transition-colors p-1 rounded"
                      title="Eliminar orden"
                    >
                      <Trash className="h-3 w-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="md:hidden">
          <div className="space-y-2">
            {ordenes.map((orden) => {
              const isExpanded = expandedMobileItems.has(orden.id)
              return (
                <div key={orden.id} className="bg-transparent rounded border border-[#BF8D6B] overflow-hidden">
                  <div className="p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-white text-xs truncate">{getEventoNombre(orden)}</div>
                        <div className="text-gray-400 text-xs mt-1">
                          {orden.User?.nombre || "N/A"} • {formatFecha(orden.fecha_creacion)}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        {getEstadoBadge(orden.estado)}
                        <button
                          onClick={(e) => toggleMobileItem(orden.id, e)}
                          className="p-1 text-[#BF8D6B] hover:text-[#a67454] transition-colors"
                        >
                          {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="text-gray-300 text-xs truncate">{orden.nombre_cliente}</div>
                      <div className="text-white font-medium text-xs">{formatMonto(getRealOrderTotal(orden))}</div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-[#BF8D6B] p-3 bg-[#BF8D6B]/10">
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-[#BF8D6B]">Cliente:</span>
                            <div className="text-white">{orden.nombre_cliente}</div>
                            <div className="text-gray-400">{orden.email_cliente}</div>
                          </div>
                          <div>
                            <span className="text-[#BF8D6B]">Vendedor:</span>
                            <div className="text-white">{orden.User?.nombre || "N/A"}</div>
                            <div className="text-gray-400">{orden.User?.email || ""}</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-[#BF8D6B]">Método de Pago:</span>
                            <div className="text-white">{getMetodoDePago(orden)}</div>
                          </div>
                          <div>
                            <span className="text-[#BF8D6B]">Cuotas:</span>
                            <div className="text-white">{getCuotas(orden)}</div>
                          </div>
                        </div>

                        <div className="flex justify-end gap-1 pt-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRowClick(orden)
                            }}
                            className="px-2 py-1 bg-[#BF8D6B] text-white rounded text-xs flex items-center gap-1 transition-colors"
                          >
                            <Eye className="h-3 w-3" />
                            Ver
                          </button>
                          <button
                            onClick={(e) => handleNotaDebito(orden, e)}
                            className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs flex items-center gap-1 transition-colors"
                          >
                            <Calculator className="h-3 w-3" />
                            Nota
                          </button>
                          <button
                            onClick={(e) => handleDeleteOrder(orden.id, e)}
                            className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs flex items-center gap-1 transition-colors"
                          >
                            <Trash className="h-3 w-3" />
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {ordenes.length === 0 && !loading && (
          <div className="text-center py-6 text-gray-400 text-sm">No se encontraron ordenes</div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4">
          <button
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-2 py-1 bg-transparent text-white border border-[#BF8D6B] rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#BF8D6B]/10 transition-colors"
          >
            Anterior
          </button>

          {currentPage > 1 && (
            <button
              onClick={() => handlePageChange(1)}
              className="px-2 py-1 bg-transparent text-white border border-[#BF8D6B] rounded text-xs hover:bg-[#BF8D6B]/10 transition-colors"
            >
              1
            </button>
          )}

          {currentPage > 2 && <span className="px-1 text-[#BF8D6B] text-xs">...</span>}

          <button
            onClick={() => handlePageChange(currentPage)}
            className="px-2 py-1 bg-[#BF8D6B] text-white rounded text-xs"
          >
            {currentPage}
          </button>

          {currentPage < totalPages - 1 && <span className="px-1 text-[#BF8D6B] text-xs">...</span>}

          {currentPage < totalPages && (
            <button
              onClick={() => handlePageChange(totalPages)}
              className="px-2 py-1 bg-transparent text-white border border-[#BF8D6B] rounded text-xs hover:bg-[#BF8D6B]/10 transition-colors"
            >
              {totalPages}
            </button>
          )}

          <button
            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-2 py-1 bg-transparent text-white border border-[#BF8D6B] rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#BF8D6B]/10 transition-colors"
          >
            Siguiente
          </button>
        </div>
      )}

      {showModal && selectedOrden && <OrdenDetalleModal orden={selectedOrden} onClose={() => setShowModal(false)} />}

      {showNotaDebitoModal && selectedOrdenForNota && (
        <NotaDebitoModal
          orden={selectedOrdenForNota}
          onClose={() => setShowNotaDebitoModal(false)}
          onSuccess={handleNotaDebitoSuccess}
        />
      )}
    </div>
  )
}
