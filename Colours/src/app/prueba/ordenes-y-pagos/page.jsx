"use client"

import { useState, useEffect, useMemo } from "react"
import { Search, Download, Eye, Trash, ChevronDown, ChevronUp, X } from "lucide-react"
import Swal from "sweetalert2"
import Header from "../components/header"
import OrdenDetalleModal from "@/app/components/entradas/ordenDetalleModal"
import apiUrls from "@/app/components/utils/apiConfig"
import useUserRoleFromLocalStorage from "@/app/components/hook/userRoleFromLocalstorage"
import { downloadCSV } from "@/app/components/utils/csvExporter"

const API_URL = apiUrls

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

  const limit = 7

  const [filters, setFilters] = useState({
    evento: "",
    estado: "",
    salon: "",
    fechaDesde: "",
    fechaHasta: "",
    metodoDePago: "",
    impuestoClave: "",
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
      queryParams.append("tipoDeCobro", filters.metodoDePago)
    }
    if (filters.impuestoClave) {
      queryParams.append("impuestoClave", filters.impuestoClave)
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
        <span className="px-2 py-1 rounded-full text-xs border bg-orange-800 text-orange-200 border-gray-700 ">
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
      impuestoClave: "",
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
      confirmButtonColor: "#ea580c",
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
            confirmButtonColor: "#ea580c",
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
            confirmButtonColor: "#ea580c",
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
          confirmButtonColor: "#ea580c",
          background: "#1F2937",
          color: "#E5E7EB",
        })
      }
    }
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

  if (loading && ordenes.length === 0) {
    return (
      <div className="p-6">
        <Header title="Ordenes y Pagos" />
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-700 "></div>
        </div>
      </div>
    )
  }

  if (userRole === null) {
    return (
      <div className="p-6">
        <Header title="Ordenes y Pagos" />
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-700 "></div>
          <p className="ml-4 text-gray-400">Cargando datos de usuario...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <Header title="Ordenes y Pagos" />
      {error && <div className="bg-red-800 border border-red-600 text-red-200 px-4 py-3 rounded mb-6">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
          <p className="text-gray-400 mb-2">Total Ordenes</p>
          <p className="text-2xl font-bold text-white">{formatMonto(summaryData.totalOrdersValue)}</p>
          <p className="text-sm text-gray-500">{totalOrdenesCount} ordenes</p>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
          <p className="text-gray-400 mb-2">Total Pagado</p>
          <p className="text-2xl font-bold text-green-400">{formatMonto(summaryData.totalPaidValue)}</p>
          <p className="text-sm text-gray-500">{summaryData.paidOrdersCount} pagos</p>
        </div>
        <div className="bg-gray-800 border border-gray-700  rounded-lg p-4 text-center">
          <p className="text-gray-200 mb-2">Por Cobrar</p>
          <p className="text-2xl font-bold text-orange-400">{formatMonto(summaryData.totalPendingValue)}</p>
          <p className="text-sm text-gray-300">Por cobrar</p>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 mb-6">
        <div className="flex flex-wrap gap-2 justify-between items-center mb-4">
          <div className="relative w-full sm:w-1/4">
            <input
              type="text"
              placeholder="Buscar por evento"
              value={filters.evento}
              onChange={(e) => setFilters({ ...filters, evento: e.target.value })}
              className="w-full bg-gray-700 border border-gray-700  rounded-lg p-3 pl-10 text-white focus:outline-none focus:ring-1 focus:ring-orange-600 transition-colors"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          </div>
          <div className="relative w-full sm:w-1/4">
            <input
              type="text"
              placeholder="Buscar por salon"
              value={filters.salon}
              onChange={(e) => setFilters({ ...filters, salon: e.target.value })}
              className="w-full bg-gray-700 border border-gray-700  rounded-lg p-3 pl-10 text-white focus:outline-none focus:ring-1 focus:ring-orange-600 transition-colors"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          </div>
          <div className="w-full sm:w-1/4">
            <select
              value={filters.estado}
              onChange={(e) => setFilters({ ...filters, estado: e.target.value })}
              className="w-full bg-gray-700 border border-gray-700  rounded-lg p-3 text-white focus:outline-none focus:ring-1 focus:ring-orange-600 transition-colors"
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
              className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              Filtros Avanzados
              {showAdvancedFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {showAdvancedFilters && (
          <div className="border-t border-gray-600 pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-300 mb-1">Fecha Desde</label>
                <input
                  type="date"
                  value={filters.fechaDesde}
                  onChange={(e) => setFilters({ ...filters, fechaDesde: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-700  rounded-lg p-3 text-white focus:outline-none focus:ring-1 focus:ring-orange-600 transition-colors"
                />
              </div>
              <div className="relative">
                <label className="block text-sm font-medium text-gray-300 mb-1">Fecha Hasta</label>
                <input
                  type="date"
                  value={filters.fechaHasta}
                  onChange={(e) => setFilters({ ...filters, fechaHasta: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-700  rounded-lg p-3 text-white focus:outline-none focus:ring-1 focus:ring-orange-600 transition-colors"
                />
              </div>
              <div className="relative">
                <label className="block text-sm font-medium text-gray-300 mb-1">Metodo de Pago</label>
                <input
                  type="text"
                  placeholder="Ej: Tarjeta, tarjeta santander, efectivo"
                  value={filters.metodoDePago}
                  onChange={(e) => setFilters({ ...filters, metodoDePago: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-700  rounded-lg p-3 text-white focus:outline-none focus:ring-1 focus:ring-orange-600 transition-colors"
                />
              </div>
              <div className="relative">
                <label className="block text-sm font-medium text-gray-300 mb-1">Tipo de Cobro</label>
                <input
                  type="text"
                  placeholder="Ej: 1, 2, 3, 6"
                  value={filters.impuestoClave}
                  onChange={(e) => setFilters({ ...filters, impuestoClave: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-700  rounded-lg p-3 text-white focus:outline-none focus:ring-1 focus:ring-orange-600 transition-colors"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={clearAllFilters}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <X className="h-4 w-4" />
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
            className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Descargar CSV
          </button>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th
                  className="px-4 py-3 text-left text-white font-medium cursor-pointer"
                  onClick={() => handleSort("nombre_cliente")}
                >
                  Cliente
                  {orderBy === "nombre_cliente" && <span>{orderDirection === "ASC" ? " ▲" : " ▼"}</span>}
                </th>
                <th className="px-4 py-3 text-left text-white font-medium">Evento</th>
                <th
                  className="px-4 py-3 text-left text-white font-medium cursor-pointer"
                  onClick={() => handleSort("fecha_creacion")}
                >
                  Fecha
                  {orderBy === "fecha_creacion" && <span>{orderDirection === "ASC" ? " ▲" : " ▼"}</span>}
                </th>
                <th
                  className="px-4 py-3 text-left text-white font-medium cursor-pointer"
                  onClick={() => handleSort("total")}
                >
                  Monto
                  {orderBy === "total" && <span>{orderDirection === "ASC" ? " ▲" : " ▼"}</span>}
                </th>
                <th
                  className="px-4 py-3 text-left text-white font-medium cursor-pointer"
                  onClick={() => handleSort("estado")}
                >
                  Estado
                  {orderBy === "estado" && <span>{orderDirection === "ASC" ? " ▲" : " ▼"}</span>}
                </th>
                <th className="px-4 py-3 text-center text-white font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {ordenes.map((orden) => (
                <tr
                  key={orden.id}
                  className="hover:bg-gray-600 cursor-pointer transition-colors"
                  onClick={() => handleRowClick(orden)}
                >
                  <td className="px-4 py-3 text-gray-300">
                    <div>
                      <div className="font-medium">{orden.nombre_cliente}</div>
                      <div className="text-sm text-gray-500">{orden.email_cliente}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-300">{getEventoNombre(orden)}</td>
                  <td className="px-4 py-3 text-gray-300">{formatFecha(orden.fecha_creacion)}</td>
                  <td className="px-4 py-3 text-gray-300 font-medium">{formatMonto(getRealOrderTotal(orden))}</td>
                  <td className="px-4 py-3">{getEstadoBadge(orden.estado)}</td>
                  <td className="px-4 py-3 text-center flex items-center justify-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRowClick(orden)
                      }}
                      className="text-orange-500 hover:text-orange-400 transition-colors p-1 rounded-md"
                      title="Ver detalles"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteOrder(orden.id, e)}
                      className="text-red-500 hover:text-red-400 transition-colors p-1 rounded-md"
                      title="Eliminar orden"
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="md:hidden divide-y divide-gray-700">
          {ordenes.map((orden) => (
            <div
              key={orden.id}
              className="p-4 hover:bg-gray-700 cursor-pointer transition-colors"
              onClick={() => handleRowClick(orden)}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="font-mono text-sm text-gray-400">
                  Vendedor: {orden.User && orden.User.nombre ? orden.User.nombre : "N/A"}
                </div>
                <div>{getEstadoBadge(orden.estado)}</div>
              </div>
              <div className="mb-2">
                <div className="font-medium text-white">{getEventoNombre(orden)}</div>
                <div className="text-sm text-gray-400">{formatFecha(orden.fecha_creacion)}</div>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex-1 min-w-0 pr-2">
                  <div className="text-sm text-gray-400 truncate">{orden.nombre_cliente}</div>
                  <div className="text-xs text-gray-500 truncate">{orden.email_cliente}</div>
                </div>
                <div className="text-white font-medium flex-shrink-0">{formatMonto(getRealOrderTotal(orden))}</div>
              </div>
              <div className="mt-3 flex justify-end gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRowClick(orden)
                  }}
                  className="p-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg transition-colors flex items-center justify-center"
                  title="Ver detalles"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => handleDeleteOrder(orden.id, e)}
                  className="p-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors flex items-center justify-center"
                  title="Eliminar orden"
                >
                  <Trash className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {ordenes.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-400">No se encontraron ordenes</div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
          >
            Anterior
          </button>

          {currentPage > 1 && (
            <button
              onClick={() => handlePageChange(1)}
              className="px-3 py-2 rounded-lg transition-colors bg-gray-700 text-white hover:bg-gray-600"
            >
              1
            </button>
          )}

          {currentPage > 2 && <span className="px-2 text-gray-400">...</span>}

          <button
            onClick={() => handlePageChange(currentPage)}
            className="px-3 py-2 rounded-lg transition-colors bg-orange-600 text-white"
          >
            {currentPage}
          </button>

          {currentPage < totalPages - 1 && <span className="px-2 text-gray-400">...</span>}

          {currentPage < totalPages && (
            <button
              onClick={() => handlePageChange(totalPages)}
              className="px-3 py-2 rounded-lg transition-colors bg-gray-700 text-white hover:bg-gray-600"
            >
              {totalPages}
            </button>
          )}

          <button
            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
          >
            Siguiente
          </button>
        </div>
      )}

      {showModal && selectedOrden && <OrdenDetalleModal orden={selectedOrden} onClose={() => setShowModal(false)} />}
    </div>
  )
}
