"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  ChevronRight,
  Eye,
  EyeOff,
  Trash2,
  Power,
  Archive,
  Edit,
  ChevronDown,
  ChevronUp,
  ListFilter,
  Info,
  X,
} from "lucide-react";
import PuntoModal from "../components/punto-modal";
import EditarModal from "../components/editar-modal";
import EdicionCompleta from "../components/edicion-completa";
import Header from "../components/header";
import UploadImageModal from "../components/upload-image-modal";
import Swal from "sweetalert2";
import apiUrls from "@/app/components/utils/apiConfig";

const API_URL = apiUrls;

export default function PuntosDeVenta() {
  const [showModal, setShowModal] = useState(false);
  const [puntos, setPuntos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMode, setFilterMode] = useState("active");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [puntoAEditar, setPuntoAEditar] = useState(null);
  const [showEdicionCompleta, setShowEdicionCompleta] = useState(false);
  const [selectedPunto, setSelectedPunto] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedPunto, setExpandedPunto] = useState(null);
  const [selectedPuntos, setSelectedPuntos] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [puntoDetalle, setPuntoDetalle] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const itemsPerPage = 10;

  useEffect(() => {
    fetchPuntos();
  }, [filterMode]);

  const removeAccents = (str) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  };

  const fetchPuntos = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/puntodeventa`);
      if (!response.ok) throw new Error("Error al obtener los puntos de venta");
      const data = await response.json();
      if (data.success) {
        const allPuntos = data.data || [];
        setPuntos(allPuntos);
      } else {
        throw new Error(data.message || "Error en los datos recibidos");
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching puntos de venta:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPuntos = puntos.filter((p) => {
    const searchText = removeAccents(searchTerm.toLowerCase());
    const matchSearch =
      removeAccents(p.nombre.toLowerCase()).includes(searchText) ||
      removeAccents(p.razon.toLowerCase()).includes(searchText) ||
      removeAccents(p.direccion.toLowerCase()).includes(searchText) ||
      removeAccents(p.email.toLowerCase()).includes(searchText) ||
      p.cuit.toString().includes(searchTerm) ||
      p.telefono.toString().includes(searchTerm);

    let matchStatus = true;
    if (filterMode === "active") {
      matchStatus = p.isActive === true;
    } else if (filterMode === "inactive") {
      matchStatus = p.isActive === false;
    }

    return matchSearch && matchStatus;
  });

  const handleAddPunto = async (newPunto) => {
    try {
      const checkResponse = await fetch(`${API_URL}/api/puntodeventa`);
      const existingPuntos = await checkResponse.json();
      if (
        existingPuntos.success &&
        existingPuntos.data.some((p) => p.nombre === newPunto.nombre)
      ) {
        throw new Error("Ya existe un punto de venta con este nombre");
      }

      const response = await fetch(`${API_URL}/api/puntodeventa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPunto),
      });

      if (!response.ok) throw new Error("Error al crear el punto de venta");

      await refreshPuntos();
      setShowModal(false);
      Swal.fire({
        icon: "success",
        title: "Punto creado",
        text: "El punto de venta fue creado correctamente",
      });
    } catch (error) {
      console.error("Error:", error);
      Swal.fire({
        icon: "error",
        title: "Error al crear punto",
        text: error.message || "Hubo un error al crear el punto de venta",
      });
    }
  };

  const refreshPuntos = async () => {
    try {
      const res = await fetch(`${API_URL}/api/puntodeventa`);
      const data = await res.json();
      if (data.success) {
        setPuntos(data.data);
      }
    } catch (error) {
      console.error("Error refreshing puntos:", error);
    }
  };

  const handleUpdatePunto = async () => {
    await refreshPuntos();
  };

  const handleDeletePunto = async (id) => {
    const confirmResult = await Swal.fire({
      title: "¿Eliminar permanentemente?",
      text: "Esta acción no se puede deshacer. ¿Deseas continuar?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (confirmResult.isConfirmed) {
      try {
        const response = await fetch(
          `${API_URL}/api/puntodeventa/delete/${id}`,
          { method: "DELETE" }
        );

        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Error al eliminar el punto de venta"
          );
        }

        Swal.fire("Eliminado", data.message, "success");
        await refreshPuntos();
      } catch (error) {
        Swal.fire("Error", error.message, "error");
      }
    }
  };

  const handleTogglePuntoStatus = async (id, isCurrentlyActive) => {
    const newStatus = !isCurrentlyActive;
    const actionText = newStatus ? "activar" : "desactivar";

    const confirmResult = await Swal.fire({
      title: `¿${newStatus ? "Activar" : "Desactivar"} punto de venta?`,
      text: `Estás a punto de ${actionText} este punto de venta.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: `Sí, ${actionText}`,
      cancelButtonText: "Cancelar",
    });

    if (!confirmResult.isConfirmed) return;

    try {
      const response = await fetch(
        `${API_URL}/api/puntodeventa/soft-delete/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: newStatus }),
        }
      );

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || `Error al ${actionText} el punto`);
      }

      setPuntos((prevPuntos) =>
        prevPuntos.map((punto) =>
          punto.id === id ? { ...punto, isActive: newStatus } : punto
        )
      );

      await Swal.fire({
        title: `Punto ${newStatus ? "activado" : "desactivado"}`,
        text: data.message,
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error al cambiar estado:", error);
      Swal.fire({
        title: "Error",
        text: error.message,
        icon: "error",
      });
    }
  };

  const togglePuntoSelection = (id) => {
    setSelectedPuntos((prev) =>
      prev.includes(id)
        ? prev.filter((puntoId) => puntoId !== id)
        : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedPuntos.length === currentItems.length) {
      setSelectedPuntos([]);
    } else {
      setSelectedPuntos(currentItems.map((punto) => punto.id));
    }
  };

  const bulkToggleStatus = async (activate) => {
    if (selectedPuntos.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Ningún punto de venta seleccionado",
        text: `Por favor selecciona al menos un punto de venta para ${
          activate ? "activar" : "desactivar"
        }`,
      });
      return;
    }

    const result = await Swal.fire({
      title: `¿${
        activate ? "Activar" : "Desactivar"
      } puntos de venta seleccionados?`,
      text: `¿Desea ${activate ? "activar" : "desactivar"} los ${
        selectedPuntos.length
      } puntos de venta seleccionados?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: activate ? "#3085d6" : "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: `Sí, ${activate ? "activar" : "desactivar"} (${
        selectedPuntos.length
      })`,
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        Swal.fire({
          title: "Procesando...",
          text: `${
            activate ? "Activando" : "Desactivando"
          } puntos de venta seleccionados`,
          allowOutsideClick: false,
          allowEscapeKey: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        const updatePromises = selectedPuntos.map((id) =>
          fetch(`${API_URL}/api/puntodeventa/soft-delete/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isActive: activate }),
          })
        );

        await Promise.all(updatePromises);

        Swal.fire({
          title: "¡Completado!",
          text: `Los puntos de venta seleccionados han sido ${
            activate ? "activados" : "desactivados"
          }`,
          icon: "success",
          confirmButtonText: "OK",
        });

        await refreshPuntos();
        setSelectedPuntos([]);
      } catch (err) {
        console.error(
          `Error al ${activate ? "activar" : "desactivar"} puntos de venta:`,
          err
        );
        Swal.fire({
          title: "Error",
          text: `No se pudieron ${
            activate ? "activar" : "desactivar"
          } los puntos de venta seleccionados.`,
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    }
  };

  const bulkDeletePuntos = async () => {
    if (selectedPuntos.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Ningún punto de venta seleccionado",
        text: "Por favor selecciona al menos un punto de venta para eliminar",
      });
      return;
    }

    const result = await Swal.fire({
      title: "¿Eliminar permanentemente?",
      text: `¿Desea eliminar permanentemente los ${selectedPuntos.length} puntos de venta seleccionados? Esta acción no se puede deshacer.`,
      icon: "error",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: `Sí, eliminar (${selectedPuntos.length})`,
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      const secondConfirm = await Swal.fire({
        title: "¿Está completamente seguro?",
        html: `
          <div class="text-left">
            <p>No podrá recuperar estos ${selectedPuntos.length} puntos de venta después de eliminarlos.</p>
            <p class="text-red-500 font-bold mt-2">Esta acción es IRREVERSIBLE.</p>
          </div>
        `,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Sí, eliminar definitivamente",
        cancelButtonText: "Cancelar",
      });

      if (!secondConfirm.isConfirmed) return;

      try {
        Swal.fire({
          title: "Procesando...",
          text: "Eliminando puntos de venta seleccionados",
          allowOutsideClick: false,
          allowEscapeKey: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        const deletePromises = selectedPuntos.map((id) =>
          fetch(`${API_URL}/api/puntodeventa/delete/${id}`, {
            method: "DELETE",
          })
        );

        await Promise.all(deletePromises);

        Swal.fire({
          title: "¡Eliminados!",
          text: "Los puntos de venta seleccionados han sido eliminados permanentemente",
          icon: "success",
          confirmButtonText: "OK",
        });

        await refreshPuntos();
        setSelectedPuntos([]);
      } catch (err) {
        console.error("Error al eliminar puntos de venta:", err);
        Swal.fire({
          title: "Error",
          text: "No se pudieron eliminar los puntos de venta seleccionados.",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    }
  };

  const totalPages = Math.ceil(filteredPuntos.length / itemsPerPage);
  const currentItems = filteredPuntos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return (
      <div className="p-2 md:p-4 bg-gray-900 min-h-screen">
        <Header title="Puntos de Venta" />
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-300">Cargando puntos de venta...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-2 md:p-4 bg-gray-900 min-h-screen">
        <Header title="Puntos de Venta" />
        <div className="alert alert-error bg-red-900 border-red-700">
          <p className="text-red-200">Error: {error}</p>
          <button
            className="btn btn-sm btn-outline border-red-600 text-red-200 hover:bg-red-700 mt-2"
            onClick={() => fetchPuntos()}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const handleShowDetail = async (puntoId) => {
    setLoadingDetail(true);
    setShowDetailModal(true);
    try {
      const response = await fetch(`${API_URL}/api/puntodeventa/${puntoId}`);
      if (!response.ok)
        throw new Error("Error al obtener el detalle del punto de venta");
      const result = await response.json();
      setPuntoDetalle(result.data || result);
    } catch (err) {
      setPuntoDetalle({ error: err.message });
    } finally {
      setLoadingDetail(false);
    }
  };

  return (
    <div className="p-2 md:p-4  ">
      {/* <Header title="" /> */}

      {/* Filtros y búsqueda con más espacio */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-70 w-full mb-6">
          {/* Campo de búsqueda */}
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="    Buscar por nombre, razón social, dirección, email, CUIT o teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-2 px-8 text-sm bg-black border-2 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent rounded-full"
              style={{
                borderColor: "#BF8D6B",
                color: "#ffffffff",
                "--tw-ring-color": "#BF8D6B",
              }}
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <Search className="h-4 w-4" style={{ color: "#BF8D6B" }} />
            </div>
          </div>

          {/* Botones de filtro y acción - ahora con más espacio */}
          <div className="flex flex-wrap gap-4 md:gap-6">
            {/* Botones de filtro */}
            <div className="flex gap-1 mr-2 md:mr-4">
              <button
                className={`px-3 py-1 text-sm rounded-l flex items-center gap-1 transition-colors border-2 ${
                  filterMode === "active"
                    ? "text-[#BF8D6B]"
                    : "bg-black hover:text-white"
                }`}
                style={
                  filterMode === "active"
                    ? { backgroundColor: "#000000ff", borderColor: "#BF8D6B" }
                    : { borderColor: "#BF8D6B", color: "#ffffffff" }
                }
                onMouseEnter={(e) => {
                  if (filterMode !== "active") {
                    e.currentTarget.style.backgroundColor = "#000000ff";
                    e.currentTarget.style.color = "#BF8D6B";
                  }
                }}
                onMouseLeave={(e) => {
                  if (filterMode !== "active") {
                    e.currentTarget.style.backgroundColor = "black";
                    e.currentTarget.style.color = "#ffffffff";
                  }
                }}
                onClick={() => setFilterMode("active")}
              >
                <span className="hidden sm:inline">Activos</span>
              </button>
              <button
                className={`px-3 py-1 text-sm flex items-center gap-1 transition-colors border-2 ${
                  filterMode === "inactive"
                    ? "text-[#BF8D6B]"
                    : "bg-black hover:text-white"
                }`}
                style={
                  filterMode === "inactive"
                    ? { backgroundColor: "#000000ff", borderColor: "#BF8D6B" }
                    : { borderColor: "#BF8D6B", color: "#ffffffff" }
                }
                onMouseEnter={(e) => {
                  if (filterMode !== "inactive") {
                    e.currentTarget.style.backgroundColor = "#000000ff";
                    e.currentTarget.style.color = "#BF8D6B";
                  }
                }}
                onMouseLeave={(e) => {
                  if (filterMode !== "inactive") {
                    e.currentTarget.style.backgroundColor = "black";
                    e.currentTarget.style.color = "#ffffffff";
                  }
                }}
                onClick={() => setFilterMode("inactive")}
              >
                <span className="hidden sm:inline">Inactivos</span>
              </button>
              <button
                className={`px-3 py-1 text-sm rounded-r flex items-center gap-1 transition-colors border-2 ${
                  filterMode === "all"
                    ? "text-[#BF8D6B]"
                    : "bg-black hover:text-white"
                }`}
                style={
                  filterMode === "all"
                    ? { backgroundColor: "#000000ff", borderColor: "#BF8D6B" }
                    : { borderColor: "#BF8D6B", color: "#ffffffff" }
                }
                onMouseEnter={(e) => {
                  if (filterMode !== "all") {
                    e.currentTarget.style.backgroundColor = "#000000ff";
                    e.currentTarget.style.color = "#BF8D6B";
                  }
                }}
                onMouseLeave={(e) => {
                  if (filterMode !== "all") {
                    e.currentTarget.style.backgroundColor = "black";
                    e.currentTarget.style.color = "#ffffffff";
                  }
                }}
                onClick={() => setFilterMode("all")}
              >
                <span className="hidden sm:inline">Todos</span>
              </button>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-2">
              <button
                className="px-3 py-1 text-sm rounded-full flex items-center gap-1 transition-colors border-2 bg-black hover:text-black"
                style={{ borderColor: "#BF8D6B", color: "#ffffffff" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#BF8D6B";
                  e.currentTarget.style.color = "white";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "black";
                  e.currentTarget.style.color = "#ffffffff";
                }}
                onClick={() => setShowModal(true)}
              >
                Agregar
              </button>
              <button
                className="px-3 py-1 text-sm rounded-full flex items-center gap-1 transition-colors border-2 bg-black hover:text-black"
                style={{ borderColor: "#BF8D6B", color: "#ffffffff" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#BF8D6B";
                  e.currentTarget.style.color = "white";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "black";
                  e.currentTarget.style.color = "#ffffffff";
                }}
                onClick={() => setShowUploadModal(true)}
              >
                Cargar imágenes
              </button>
            </div>
          </div>
        </div>

        {/* Botones de acciones masivas */}
        {selectedPuntos.length > 0 && (
          <div className="flex flex-col md:flex-row gap-3 mt-4">
            <button
              className="px-3 py-1 text-sm rounded flex items-center gap-1 transition-colors border-2 bg-black hover:text-black"
              style={{ borderColor: "#BF8D6B", color: "#ffffffff" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#BF8D6B";
                e.currentTarget.style.color = "white";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "black";
                e.currentTarget.style.color = "#ffffffff";
              }}
              onClick={() => bulkToggleStatus(true)}
            >
              <Power className="h-3 w-3" />
              Activar {selectedPuntos.length}
            </button>
            <button
              className="px-3 py-1 text-sm rounded flex items-center gap-1 transition-colors border-2 bg-black hover:text-black"
              style={{ borderColor: "#BF8D6B", color: "#ffffffff" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#BF8D6B";
                e.currentTarget.style.color = "white";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "black";
                e.currentTarget.style.color = "#ffffffff";
              }}
              onClick={() => bulkToggleStatus(false)}
            >
              <Archive className="h-3 w-3" />
              Desactivar {selectedPuntos.length}
            </button>
            <button
              className="px-3 py-1 text-sm rounded flex items-center gap-1 transition-colors border-2 bg-black hover:text-black"
              style={{ borderColor: "#BF8D6B", color: "#ffffffff" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#BF8D6B";
                e.currentTarget.style.color = "white";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "black";
                e.currentTarget.style.color = "#ffffffff";
              }}
              onClick={bulkDeletePuntos}
            >
              <Trash2 className="h-3 w-3" />
              Eliminar {selectedPuntos.length}
            </button>
          </div>
        )}
      </div>

      {/* Tabla de puntos de venta */}
      <div className="overflow-x-auto">
        {/* Vista de escritorio */}
        <div className="hidden md:block">
          <table className="min-w-full bg-gray-800 rounded-lg overflow-hidden">
            <thead className="bg-gray-900">
              <tr>
                <th className="w-8 px-3 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={
                      selectedPuntos.length === currentItems.length &&
                      currentItems.length > 0
                    }
                    onChange={toggleSelectAll}
                    className="w-4 h-4 bg-gray-700 border-gray-600 rounded"
                    style={{ accentColor: "#BF8D6B" }}
                  />
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Razón Social
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Dirección
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  CUIT
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Teléfono
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-48">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {currentItems.map((punto, index) => (
                <tr
                  key={punto.id}
                  className={`${
                    index % 2 === 0 ? "bg-gray-800" : "bg-gray-750"
                  } hover:bg-gray-700 transition-colors`}
                >
                  <td
                    className="px-3 py-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={selectedPuntos.includes(punto.id)}
                      onChange={() => togglePuntoSelection(punto.id)}
                      className="w-4 h-4 bg-gray-700 border-gray-600 rounded"
                      style={{ accentColor: "#BF8D6B" }}
                    />
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-200">
                    {punto.razon}
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-200">
                    {punto.nombre}
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-200">
                    {punto.direccion}
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-200">
                    {punto.cuit}
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-200">
                    {punto.email}
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-200">
                    {punto.telefono}
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-200">
                    {punto.es_online ? "Online" : "Físico"}
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        punto.isActive
                          ? "text-white"
                          : "bg-red-900 text-red-200"
                      }`}
                      style={
                        punto.isActive ? { backgroundColor: "#BF8D6B" } : {}
                      }
                    >
                      {punto.isActive ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex gap-1">
                      <button
                        className="p-1 rounded transition-colors border-2 bg-black hover:text-black"
                        style={{ borderColor: "#BF8D6B", color: "#BF8D6B" }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#BF8D6B";
                          e.currentTarget.style.color = "white";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "black";
                          e.currentTarget.style.color = "#BF8D6B";
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShowDetail(punto.id);
                        }}
                        title="Detalle"
                      >
                        <Info className="h-4 w-4" />
                      </button>
                      <button
                        className="p-1 rounded transition-colors border-2 bg-black hover:text-black"
                        style={{ borderColor: "#BF8D6B", color: "#BF8D6B" }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#BF8D6B";
                          e.currentTarget.style.color = "white";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "black";
                          e.currentTarget.style.color = "#BF8D6B";
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          // setPuntoAEditar(punto); // Elimina esta línea
                          setSelectedPunto(punto); // Agrega esta línea
                          setShowEdicionCompleta(true); // Agrega esta línea
                        }}
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        className={`p-1 rounded transition-colors border-2 ${
                          punto.isActive
                            ? "text-yellow-400 hover:text-yellow-300 hover:bg-gray-700 border-yellow-400"
                            : "bg-black hover:text-black"
                        }`}
                        style={
                          !punto.isActive
                            ? { borderColor: "#BF8D6B", color: "#BF8D6B" }
                            : {}
                        }
                        onMouseEnter={(e) => {
                          if (!punto.isActive) {
                            e.currentTarget.style.backgroundColor = "#BF8D6B";
                            e.currentTarget.style.color = "black";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!punto.isActive) {
                            e.currentTarget.style.backgroundColor = "black";
                            e.currentTarget.style.color = "#BF8D6B";
                          }
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTogglePuntoStatus(punto.id, punto.isActive);
                        }}
                        title={punto.isActive ? "Desactivar" : "Activar"}
                      >
                        {punto.isActive ? (
                          <Archive className="h-4 w-4" />
                        ) : (
                          <Power className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        className="p-1 rounded transition-colors border-2"
                        style={{ color: "#ffffffff", borderColor: "#BF8D6B" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePunto(punto.id);
                        }}
                        title="Eliminar permanentemente"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#BF8D6B";
                          e.currentTarget.style.color = "white";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                          e.currentTarget.style.color = "#BF8D6B";
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Vista móvil mejorada */}
        <div className="md:hidden space-y-4">
          {currentItems.map((punto) => (
            <div
              key={punto.id}
              className="bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={selectedPuntos.includes(punto.id)}
                    onChange={() => togglePuntoSelection(punto.id)}
                    className="mt-1 w-4 h-4 bg-gray-700 border-gray-600 rounded"
                    style={{ accentColor: "#BF8D6B" }}
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-200">
                      {punto.nombre}
                    </div>
                    <div className="text-sm text-gray-400 truncate">
                      {punto.razon}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() =>
                    setExpandedPunto(
                      expandedPunto === punto.id ? null : punto.id
                    )
                  }
                  className="text-gray-400 flex items-center gap-1 ml-2"
                >
                  {expandedPunto === punto.id ? (
                    <>
                      <span className="text-xs">Cerrar</span>
                      <ChevronUp className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      <span className="text-xs">Ver</span>
                      <ChevronDown className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>

              {expandedPunto === punto.id && (
                <div className="mt-4 space-y-3 overflow-x-hidden">
                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex flex-col">
                      <span className="text-gray-400 text-sm">
                        Razón Social:
                      </span>
                      <span className="break-words text-gray-200">
                        {punto.razon}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-400 text-sm">Dirección:</span>
                      <span className="break-words text-gray-200">
                        {punto.direccion}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-400 text-sm">CUIT:</span>
                      <span className="text-gray-200">{punto.cuit}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-400 text-sm">Email:</span>
                      <span className="break-words text-gray-200">
                        {punto.email}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-400 text-sm">Teléfono:</span>
                      <span className="text-gray-200">{punto.telefono}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-400 text-sm">Tipo:</span>
                      <span className="text-gray-200">
                        {punto.es_online ? "Online" : "Físico"}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-400 text-sm">Estado:</span>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full w-fit mt-1 ${
                          punto.isActive
                            ? "text-white"
                            : "bg-red-900 text-red-200"
                        }`}
                        style={
                          punto.isActive ? { backgroundColor: "#BF8D6B" } : {}
                        }
                      >
                        {punto.isActive ? "Activo" : "Inactivo"}
                      </span>
                    </div>
                  </div>

                  {/* Botones de acción optimizados para móvil */}
                  <div className="flex justify-between pt-3 mt-2 border-t border-gray-700">
                    <div className="grid grid-cols-2 gap-2 w-full">
                      <button
                        className="p-2 rounded transition-colors flex items-center justify-center border-2 bg-black hover:text-black"
                        style={{ borderColor: "#BF8D6B", color: "#BF8D6B" }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#BF8D6B";
                          e.currentTarget.style.color = "black";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "black";
                          e.currentTarget.style.color = "#BF8D6B";
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShowDetail(punto.id);
                        }}
                      >
                        <Info className="h-4 w-4" />
                      </button>
                      <button
                        className="p-2 rounded transition-colors flex items-center justify-center border-2 bg-black hover:text-black"
                        style={{ borderColor: "#BF8D6B", color: "#BF8D6B" }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#BF8D6B";
                          e.currentTarget.style.color = "black";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "black";
                          e.currentTarget.style.color = "#BF8D6B";
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          // setPuntoAEditar(punto); // Elimina esta línea
                          setSelectedPunto(punto); // Agrega esta línea
                          setShowEdicionCompleta(true); // Agrega esta línea
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        className={`p-2 rounded transition-colors flex items-center justify-center border-2 ${
                          punto.isActive
                            ? "text-yellow-400 hover:text-yellow-300 hover:bg-gray-700 border-yellow-400"
                            : "bg-black hover:text-black"
                        }`}
                        style={
                          !punto.isActive
                            ? { borderColor: "#BF8D6B", color: "#BF8D6B" }
                            : {}
                        }
                        onMouseEnter={(e) => {
                          if (!punto.isActive) {
                            e.currentTarget.style.backgroundColor = "#BF8D6B";
                            e.currentTarget.style.color = "black";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!punto.isActive) {
                            e.currentTarget.style.backgroundColor = "black";
                            e.currentTarget.style.color = "#BF8D6B";
                          }
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTogglePuntoStatus(punto.id, punto.isActive);
                        }}
                      >
                        {punto.isActive ? (
                          <Archive className="h-4 w-4" />
                        ) : (
                          <Power className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        className="p-2 rounded transition-colors flex items-center justify-center border-2"
                        style={{ color: "#ffffffff", borderColor: "#BF8D6B" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePunto(punto.id);
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#BF8D6B";
                          e.currentTarget.style.color = "white";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                          e.currentTarget.style.color = "#BF8D6B";
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Botón para ver detalles completos */}
                  <button
                    className="px-3 py-1 text-sm rounded flex items-center justify-center gap-2 transition-colors border-2 bg-black hover:text-black w-full mt-2"
                    style={{ borderColor: "#BF8D6B", color: "#ffffffff" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#BF8D6B";
                      e.currentTarget.style.color = "white";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "black";
                      e.currentTarget.style.color = "#ffffffff";
                    }}
                    onClick={() => {
                      setSelectedPunto(punto);
                      setShowEdicionCompleta(true);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                    Ver detalles completos
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Mensaje cuando no hay resultados */}
      {filteredPuntos.length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-400">
            No se encontraron puntos de venta que coincidan con los criterios de
            búsqueda
          </p>
        </div>
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-1">
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              className={`px-3 py-2 text-sm rounded transition-colors border-2 ${
                currentPage === index + 1
                  ? "text-black"
                  : "bg-black hover:text-black"
              }`}
              style={
                currentPage === index + 1
                  ? { backgroundColor: "#BF8D6B", borderColor: "#BF8D6B" }
                  : { borderColor: "#BF8D6B", color: "#BF8D6B" }
              }
              onMouseEnter={(e) => {
                if (currentPage !== index + 1) {
                  e.currentTarget.style.backgroundColor = "#BF8D6B";
                  e.currentTarget.style.color = "black";
                }
              }}
              onMouseLeave={(e) => {
                if (currentPage !== index + 1) {
                  e.currentTarget.style.backgroundColor = "black";
                  e.currentTarget.style.color = "#BF8D6B";
                }
              }}
              onClick={() => setCurrentPage(index + 1)}
            >
              {index + 1}
            </button>
          ))}
          {currentPage < totalPages && (
            <button
              className="px-3 py-2 text-sm rounded transition-colors border-2 bg-black hover:text-black"
              style={{ borderColor: "#BF8D6B", color: "#BF8D6B" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#BF8D6B";
                e.currentTarget.style.color = "black";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "black";
                e.currentTarget.style.color = "#BF8D6B";
              }}
              onClick={() => setCurrentPage((prev) => prev + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      {/* Modales */}
      {showModal && (
        <PuntoModal
          onClose={() => setShowModal(false)}
          onSubmit={handleAddPunto}
        />
      )}

      {puntoAEditar && (
        <EditarModal
          punto={puntoAEditar}
          onClose={() => setPuntoAEditar(null)}
          onUpdate={handleUpdatePunto}
        />
      )}

      {showEdicionCompleta && selectedPunto && (
        <EdicionCompleta
          punto={selectedPunto}
          onClose={() => {
            setShowEdicionCompleta(false);
            setSelectedPunto(null);
          }}
          onUpdate={() => {
            refreshPuntos();
            setShowEdicionCompleta(false);
            setSelectedPunto(null);
          }}
        />
      )}

      {showUploadModal && (
        <UploadImageModal
          onClose={() => setShowUploadModal(false)}
          API_URL={`${API_URL}/api/upload/image`}
        />
      )}

      {/* Modal de Detalle */}
      {showDetailModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg border-2 border-yellow-600 p-6 w-full max-w-3xl shadow-lg shadow-yellow-800/20 relative max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Info className="h-5 w-5 text-yellow-400" /> Detalle del Punto
                de Venta
              </h2>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setPuntoDetalle(null);
                }}
                className="text-yellow-500 hover:text-yellow-300 transition-colors"
                aria-label="Cerrar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-y-auto" style={{ maxHeight: "65vh" }}>
              {loadingDetail ? (
                <div className="text-center py-8 text-gray-300">
                  Cargando detalle...
                </div>
              ) : puntoDetalle?.error ? (
                <div className="mb-4 p-3 bg-red-900/50 text-red-300 text-sm rounded-lg border border-red-700">
                  {puntoDetalle.error}
                </div>
              ) : puntoDetalle ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white">
                  <div className="space-y-4">
                    {/* Imagen del punto de venta */}
                    {(puntoDetalle.image || puntoDetalle.imagen) && (
                      <div>
                        <span className="block text-sm text-yellow-400 mb-1">
                          Imagen
                        </span>
                        <div className="p-3 bg-gray-700 rounded-lg border border-yellow-600 flex justify-center">
                          <img
                            src={puntoDetalle.image || puntoDetalle.imagen}
                            alt="Imagen del punto de venta"
                            className="max-h-48 rounded shadow"
                            style={{ maxWidth: "100%", objectFit: "contain" }}
                          />
                        </div>
                      </div>
                    )}
                    <div>
                      <span className="block text-sm text-yellow-400 mb-1">
                        Razón Social
                      </span>
                      <div className="p-3 bg-gray-700 rounded-lg border border-yellow-600">
                        {puntoDetalle.razon}
                      </div>
                    </div>
                    <div>
                      <span className="block text-sm text-yellow-400 mb-1">
                        Nombre
                      </span>
                      <div className="p-3 bg-gray-700 rounded-lg border border-yellow-600">
                        {puntoDetalle.nombre}
                      </div>
                    </div>
                    <div>
                      <span className="block text-sm text-yellow-400 mb-1">
                        Dirección
                      </span>
                      <div className="p-3 bg-gray-700 rounded-lg border border-yellow-600">
                        {puntoDetalle.direccion}
                      </div>
                    </div>
                    <div>
                      <span className="block text-sm text-yellow-400 mb-1">
                        CUIT
                      </span>
                      <div className="p-3 bg-gray-700 rounded-lg border border-yellow-600">
                        {puntoDetalle.cuit}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <span className="block text-sm text-yellow-400 mb-1">
                        Email
                      </span>
                      <div className="p-3 bg-gray-700 rounded-lg border border-yellow-600">
                        {puntoDetalle.email}
                      </div>
                    </div>
                    <div>
                      <span className="block text-sm text-yellow-400 mb-1">
                        Teléfono
                      </span>
                      <div className="p-3 bg-gray-700 rounded-lg border border-yellow-600">
                        {puntoDetalle.telefono}
                      </div>
                    </div>
                    <div>
                      <span className="block text-sm text-yellow-400 mb-1">
                        Tipo
                      </span>
                      <div className="p-3 bg-gray-700 rounded-lg border border-yellow-600">
                        {puntoDetalle.es_online ? "Online" : "Físico"}
                      </div>
                    </div>
                    <div>
                      <span className="block text-sm text-yellow-400 mb-1">
                        Estado
                      </span>
                      <div className="p-3 bg-gray-700 rounded-lg border border-yellow-600">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            puntoDetalle.isActive
                              ? "text-white"
                              : "bg-red-900 text-red-200"
                          }`}
                          style={
                            puntoDetalle.isActive
                              ? { backgroundColor: "#BF8D6B" }
                              : {}
                          }
                        >
                          {puntoDetalle.isActive ? "Activo" : "Inactivo"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-gray-300">
                  No hay información para mostrar.
                </div>
              )}
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setPuntoDetalle(null);
                }}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg border border-gray-500 transition-colors duration-300"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
