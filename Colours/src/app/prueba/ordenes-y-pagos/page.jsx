"use client"

import { useState, useEffect, useMemo } from "react"
import { Search, Download, Eye, Trash } from "lucide-react" // Importar Trash
import Swal from "sweetalert2" // Importar SweetAlert2
import Header from "../components/header"
import OrdenDetalleModal from "@/app/components/entradas/ordenDetalleModal"
import apiUrls from "@/app/components/utils/apiConfig"
import useUserRoleFromLocalStorage from "@/app/components/hook/userRoleFromLocalstorage"
import { downloadCSV } from "@/app/components/utils/csvExporter" // Importar downloadCSV

const API_URL = apiUrls

export default function OrdenesYPagos() {
  const { userRole, userId } = useUserRoleFromLocalStorage()
  const [ordenes, setOrdenes] = useState([])
  const [allOrdersForSummary, setAllOrdersForSummary] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedOrden, setSelectedOrden] = useState(null)
  const [showModal, setShowModal] = useState(false)

  // Paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalOrdenesCount, setTotalOrdenesCount] = useState(0)
  const limit = 7

  // Filtros y Ordenamiento
  const [filters, setFilters] = useState({
    evento: "",
    estado: "",
    salon: "",
  })
  const [orderBy, setOrderBy] = useState("fecha_creacion")
  const [orderDirection, setOrderDirection] = useState("DESC")

  // Función para construir la URL con filtros y ordenamiento
  const buildApiUrl = (basePath, currentLimit, currentOffset) => {
    const queryParams = new URLSearchParams()
    queryParams.append("limit", currentLimit)
    queryParams.append("offset", currentOffset)

    // Añadir filtros
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

    // Añadir ordenamiento
    queryParams.append("orderBy", orderBy)
    queryParams.append("orderDirection", orderDirection)

    return `${basePath}/api/order?${queryParams.toString()}`
  }

  // Fetch órdenes para la tabla paginada
  const fetchPaginatedOrdenes = async (page = 1) => {
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
        setTotalOrdenesCount(data.data.pagination?.total || 0)
        setTotalPages(Math.ceil((data.data.pagination?.total || 0) / limit))
      } else {
        setError("Error al cargar las órdenes: " + (data.message || "Desconocido"))
      }
    } catch (err) {
      setError("Error de conexión al cargar órdenes.")
      console.error("Error fetching paginated orders:", err)
    } finally {
      setLoading(false)
    }
  }

  // Fetch todas las órdenes para el resumen y CSV
  const fetchAllOrdersForSummary = async () => {
    if (userRole === null) return

    try {
      // Usar un límite alto para obtener todas las órdenes
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

  // Obtener nombre del evento desde los detalles
  const getEventoNombre = (orden) => {
    if (orden.DetalleDeOrdens && orden.DetalleDeOrdens.length > 0) {
      return orden.DetalleDeOrdens[0]?.Entrada?.Evento?.nombre || "Sin evento"
    }
    return "Sin evento"
  }

  // Formatear fecha
  const formatFecha = (fecha) => {
    if (!fecha) return "Sin fecha"
    return new Date(fecha).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  // Formatear monto
  const formatMonto = (monto) => {
    return `$${Number.parseFloat(monto || 0).toLocaleString("es-ES", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  }

  // Obtener el monto real de la orden (total de pago si existe, sino total de la orden)
  const getRealOrderTotal = (orden) => {
    if (orden.Pagos && orden.Pagos.length > 0) {
      return orden.Pagos[0].total
    }
    return orden.total
  }

  // Obtener badge de estado
  const getEstadoBadge = (estado) => {
    switch (estado) {
      case "pagado":
        return (
          <span className="px-2 py-1 rounded-full text-xs bg-green-900/50 text-green-300 border border-green-700">
            Pagado
          </span>
        )
      case "pendiente":
        return (
          <span className="px-2 py-1 rounded-full text-xs bg-orange-900/50 text-orange-300 border border-orange-700">
            Pendiente
          </span>
        )
      case "cancelado":
        return (
          <span className="px-2 py-1 rounded-full text-xs bg-red-900/50 text-red-300 border border-red-700">
            Cancelado
          </span>
        )
      default:
        return (
          <span className="px-2 py-1 rounded-full text-xs bg-blue-900/50 text-blue-300 border border-blue-700">
            {estado}
          </span>
        )
    }
  }

  // Manejar clic en fila
  const handleRowClick = (orden) => {
    setSelectedOrden(orden)
    setShowModal(true)
  }

  // Manejar cambio de página
  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  // Manejar cambio de ordenamiento
  const handleSort = (field) => {
    const allowedSortFields = ["fecha_creacion", "estado", "total", "nombre_cliente", "email_cliente"]
    if (!allowedSortFields.includes(field)) {
      console.warn(`Sorting by field "${field}" is not allowed by the backend.`)
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

  // Función para eliminar una orden
  const handleDeleteOrder = async (orderId, event) => {
    event.stopPropagation() // Evitar que se dispare el handleRowClick

    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "¡No podrás revertir esto!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#BF8D6B",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      background: "#1F2937", // Fondo oscuro para que coincida con tu tema
      color: "#E5E7EB", // Color de texto claro
    })

    if (result.isConfirmed) {
      try {
        const response = await fetch(`${API_URL}/api/order/${orderId}`, {
          method: "DELETE",
        })
        const data = await response.json()

        if (data.success) {
          Swal.fire({
            title: "¡Eliminada!",
            text: data.message,
            icon: "success",
            confirmButtonColor: "#BF8D6B",
            background: "#1F2937",
            color: "#E5E7EB",
          })
          // Recargar las órdenes después de la eliminación
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
          title: "Error de conexión",
          text: "No se pudo conectar con el servidor para eliminar la orden.",
          icon: "error",
          confirmButtonColor: "#BF8D6B",
          background: "#1F2937",
          color: "#E5E7EB",
        })
      }
    }
  }

  // Calculate summary totals using useMemo for performance, based on allOrdersForSummary
  const { totalOrdersValue, totalPaidValue, totalPendingValue, paidOrdersCount } = useMemo(() => {
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

  // Efecto para cargar órdenes paginadas cuando cambia la página, filtros, ordenamiento o el rol/ID del usuario
  useEffect(() => {
    if (userRole !== null) {
      fetchPaginatedOrdenes(currentPage)
    }
  }, [currentPage, userRole, userId, filters, orderBy, orderDirection])

  // Efecto para cargar todas las órdenes para el resumen cuando el rol/ID del usuario se carga, o cambian filtros/ordenamiento
  useEffect(() => {
    if (userRole !== null) {
      fetchAllOrdersForSummary()
    }
  }, [userRole, userId, filters, orderBy, orderDirection])

  if (loading && ordenes.length === 0) {
    return (
      <div className="p-6">
        <Header title="Órdenes y Pagos" />
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#BF8D6B]"></div>
        </div>
      </div>
    )
  }

  if (userRole === null) {
    return (
      <div className="p-6">
        <Header title="Órdenes y Pagos" />
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#BF8D6B]"></div>
          <p className="ml-4 text-gray-400">Cargando datos de usuario...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <Header title="Órdenes y Pagos" />
      {error && <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded mb-6">{error}</div>}
      {/* Resumen Total */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-[#2A2F3D] border border-[#2A2F3D] rounded-lg p-4 text-center">
          <p className="text-gray-400 mb-2">Total Órdenes</p>
          <p className="text-2xl font-bold text-white">{formatMonto(totalOrdersValue)}</p>
          <p className="text-sm text-gray-500">{totalOrdenesCount} órdenes</p>
        </div>
        <div className="bg-[#2A2F3D] border border-[#2A2F3D] rounded-lg p-4 text-center">
          <p className="text-gray-400 mb-2">Total Pagado</p>
          <p className="text-2xl font-bold text-green-400">{formatMonto(totalPaidValue)}</p>
          <p className="text-sm text-gray-500">{paidOrdersCount} pagos</p>
        </div>
        <div className="bg-[#2A2F3D] bg-opacity-20 border border-[#C88D6B] rounded-lg p-4 text-center">
          <p className="text-gray-200 mb-2">Pendiente</p>
          <p className="text-2xl font-bold text-[#C88D6B]">{formatMonto(totalPendingValue)}</p>
          <p className="text-sm text-gray-300">Por cobrar</p>
        </div>
      </div>
      {/* Filtros de Búsqueda */}
      <div className="flex flex-wrap gap-2 justify-between items-center mb-6">
        <div className="relative w-full sm:w-1/4">
          <input
            type="text"
            placeholder="Buscar por evento"
            value={filters.evento}
            onChange={(e) => setFilters({ ...filters, evento: e.target.value })}
            className="w-full bg-gray-700 border border-[#BF8D6B] rounded-lg p-3 pl-10 text-white focus:outline-none focus:ring-1 focus:ring-[#BF8D6B] transition-colors"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        </div>
        <div className="relative w-full sm:w-1/4">
          <input
            type="text"
            placeholder="Buscar por salón"
            value={filters.salon}
            onChange={(e) => setFilters({ ...filters, salon: e.target.value })}
            className="w-full bg-gray-700 border border-[#BF8D6B] rounded-lg p-3 pl-10 text-white focus:outline-none focus:ring-1 focus:ring-[#BF8D6B] transition-colors"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        </div>
        <div className="w-full sm:w-1/4">
          <select
            value={filters.estado}
            onChange={(e) => setFilters({ ...filters, estado: e.target.value })}
            className="w-full bg-gray-700 border border-[#BF8D6B] rounded-lg p-3 text-white focus:outline-none focus:ring-1 focus:ring-[#BF8D6B] transition-colors"
          >
            <option value="">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="pagado">Pagado</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() =>
              downloadCSV(
                allOrdersForSummary,
                totalOrdersValue,
                totalPaidValue,
                totalPendingValue,
                totalOrdenesCount,
                paidOrdersCount,
              )
            }
            className="px-4 py-2 bg-[#BF8D6B] hover:bg-[#A67A5B] text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Descargar CSV
          </button>
        </div>
      </div>
      {/* Tabla de Órdenes (Desktop) y Tarjetas (Mobile) */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        {/* Vista Desktop - Tabla */}
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
                  className="hover:bg-gray-700/50 cursor-pointer transition-colors"
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
                      className="text-[#BF8D6B] hover:text-[#A67A5B] transition-colors p-1 rounded-md" // Añadido padding y rounded
                      title="Ver detalles"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteOrder(orden.id, e)}
                      className="text-red-500 hover:text-red-400 transition-colors p-1 rounded-md" // Añadido padding y rounded
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
        {/* Vista Mobile - Tarjetas */}
        <div className="md:hidden divide-y divide-gray-700">
          {ordenes.map((orden) => (
            <div
              key={orden.id}
              className="p-4 hover:bg-gray-700/50 cursor-pointer transition-colors"
              onClick={() => handleRowClick(orden)}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="font-mono text-sm text-gray-400">Vendedor: {orden.User?.nombre || "N/A"}</div>
                <div>{getEstadoBadge(orden.estado)}</div>
              </div>
              <div className="mb-2">
                <div className="font-medium text-white">{getEventoNombre(orden)}</div>
                <div className="text-sm text-gray-400">{formatFecha(orden.fecha_creacion)}</div>
              </div>
              {/* Sección de Cliente y Monto - Ajustes para responsive */}
              <div className="flex justify-between items-center">
                <div className="flex-1 min-w-0 pr-2">
                  {" "}
                  {/* Permite que este div crezca y trunque */}
                  <div className="text-sm text-gray-400 truncate">{orden.nombre_cliente}</div> {/* Truncar nombre */}
                  <div className="text-xs text-gray-500 truncate">{orden.email_cliente}</div> {/* Truncar email */}
                </div>
                <div className="text-white font-medium flex-shrink-0">
                  {" "}
                  {/* Evita que el monto se encoja */}
                  {formatMonto(getRealOrderTotal(orden))}
                </div>
              </div>
              <div className="mt-3 flex justify-end gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRowClick(orden)
                  }}
                  className="p-2 bg-[#BF8D6B] hover:bg-[#A67A5B] text-white rounded-lg transition-colors flex items-center justify-center" // Botón más compacto
                  title="Ver detalles"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => handleDeleteOrder(orden.id, e)}
                  className="p-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors flex items-center justify-center" // Botón más compacto
                  title="Eliminar orden"
                >
                  <Trash className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
        {ordenes.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-400">No se encontraron órdenes</div>
        )}
      </div>
      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
          >
            Anterior
          </button>
          {/* Se muestran todos los números de página */}
          {Array.from({ length: totalPages }, (_, i) => {
            const page = i + 1
            return (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  currentPage === page ? "bg-[#BF8D6B] text-white" : "bg-gray-700 text-white hover:bg-gray-600"
                }`}
              >
                {page}
              </button>
            )
          })}
          <button
            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
          >
            Siguiente
          </button>
        </div>
      )}
      {/* Modal de Detalle */}
      {showModal && selectedOrden && (
        <div>
          <OrdenDetalleModal orden={selectedOrden} onClose={() => setShowModal(false)} />
        </div>
      )}
    </div>
  )
}
