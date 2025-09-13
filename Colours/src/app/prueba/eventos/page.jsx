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
  Calendar,
  Clock,
  Users,
  ListFilter,
  Info,
  X,
  FileText,
} from "lucide-react";
import Header from "../components/header";
import EventoModal from "../components/evento-modal";
import EventoEditarModal from "../components/evento-editar-modal";
import Swal from "sweetalert2";
import apiUrls from "@/app/components/utils/apiConfig";
import EntradasModal from "../components/entradas-modal";
import UploadImageModal from "../components/upload-image-modal";

const API_URL = apiUrls;

export default function Eventos() {
  const [isClient, setIsClient] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false); // Corrected syntax error
  const [currentPage, setCurrentPage] = useState(1);
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMode, setFilterMode] = useState("active");
  const [selectedEventos, setSelectedEventos] = useState([]);
  const [eventoEditar, setEventoEditar] = useState(null);
  const [expandedEvento, setExpandedEvento] = useState(null);
  const [showEntradasModal, setShowEntradasModal] = useState(false);
  const [eventoEntradas, setEventoEntradas] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [eventoDetalle, setEventoDetalle] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [entradasDetalle, setEntradasDetalle] = useState([]);
  const [loadingEntradas, setLoadingEntradas] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const itemsPerPage = 10;

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      fetchEventos();
    }
  }, [filterMode, isClient]);

  const removeAccents = (str) => {
    return str?.normalize("NFD").replace(/[\u0300-\u036f]/g, "") || "";
  };

  const fetchEventos = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_URL}/api/evento?activo=${
          filterMode !== "all" ? filterMode === "active" : ""
        }`
      );

      if (!response.ok) {
        throw new Error("Error al cargar los eventos");
      }

      const resultData = await response.json();

      if (resultData.success && Array.isArray(resultData.data)) {
        const mappedEventos = resultData.data.map((evento) => {
          return {
            id: evento.id,
            nombre: evento.nombre,
            descripcion: evento.descripcion || "Sin descripción",
            fecha: evento.fecha,
            fechaFormateada: formatDateTime(evento.fecha),
            duracion: evento.duracion,
            capacidad: evento.capacidad,
            activo: evento.activo,
            salon: evento.salonNombre || "Sin salón asignado",
          };
        });

        setEventos(mappedEventos);
      } else {
        setEventos([]);
        throw new Error("Formato de respuesta incorrecto");
      }

      setError(null);
    } catch (err) {
      setError(
        "No se pudieron cargar los eventos. Por favor intente nuevamente."
      );
      Swal.fire({
        icon: "error",
        title: "Error al cargar eventos",
        text: err.message || "Hubo un problema al cargar los eventos",
      });
      setEventos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const formatDateTime = (dateString) => {
    try {
      if (!dateString) return "Fecha no disponible";

      const date = new Date(dateString);

      const day = String(date.getUTCDate()).padStart(2, "0");
      const month = String(date.getUTCMonth() + 1).padStart(2, "0");
      const year = date.getUTCFullYear();
      const hours = String(date.getUTCHours()).padStart(2, "0");
      const minutes = String(date.getUTCMinutes()).padStart(2, "0");

      return `${day}/${month}/${year}, ${hours}:${minutes}`;
    } catch (e) {
      console.error("Error formateando fecha:", e, dateString);
      return dateString || "Fecha no disponible";
    }
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);

    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    const hours = String(date.getUTCHours()).padStart(2, "0");
    const minutes = String(date.getUTCMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const eventosFiltrados = eventos.filter((evento) => {
    const searchText = removeAccents(searchTerm.toLowerCase());
    return (
      removeAccents(evento.nombre?.toLowerCase()).includes(searchText) ||
      removeAccents(evento.salon?.toLowerCase()).includes(searchText) ||
      formatDateTime(evento.fecha)
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (evento.duracion?.toString() || "").includes(searchTerm) ||
      (evento.capacidad?.toString() || "").includes(searchTerm)
    );
  });

  const toggleEventoSelection = (id) => {
    setSelectedEventos((prev) =>
      prev.includes(id)
        ? prev.filter((eventoId) => eventoId !== id)
        : [...prev, id]
    );
  };

  const toggleAllSelection = () => {
    if (selectedEventos.length === currentItems.length) {
      setSelectedEventos([]);
    } else {
      setSelectedEventos(currentItems.map((evento) => evento.id));
    }
  };

  const handleEventoAdded = async (eventoData) => {
    try {
      if (!eventoData.nombre) {
        throw new Error("El campo 'nombre' es obligatorio.");
      }
      const response = await fetch(`${API_URL}/api/evento`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventoData),
      });

      if (!response.ok) {
        throw new Error("Error al agregar el evento");
      }

      const result = await response.json();

      Swal.fire({
        title: "¡Éxito!",
        text: result.message || "El evento ha sido agregado correctamente",
        icon: "success",
      });

      fetchEventos();
      setShowModal(false);
    } catch (err) {
      Swal.fire({
        title: "Error",
        text: err.message || "No se pudo agregar el evento.",
        icon: "error",
      });
    }
  };

  const handleEventoUpdated = async (id, eventoData) => {
    try {
      if (!id) {
        throw new Error("El ID del evento no es válido.");
      }

      const response = await fetch(`${API_URL}/api/evento/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventoData),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar el evento");
      }

      const result = await response.json();

      Swal.fire({
        title: "¡Éxito!",
        text: result.message || "El evento ha sido actualizado correctamente",
        icon: "success",
      });

      fetchEventos();
      setShowEditModal(false);
    } catch (err) {
      fetchEventos();
    }
  };

  const handleLogicalDelete = async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/evento/${id}`, {
        method: "PATCH",
      });

      if (!response.ok) {
        throw new Error("Error al desactivar el evento");
      }

      const result = await response.json();

      Swal.fire({
        title: "¡Completado!",
        text: result.message || "El evento ha sido desactivado correctamente",
        icon: "success",
      });

      fetchEventos();
    } catch (err) {
      Swal.fire({
        title: "Error",
        text: "No se pudo desactivar el evento.",
        icon: "error",
      });
    }
  };

  const handlePhysicalDelete = async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/evento/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Error al eliminar el evento");
      }

      const result = await response.json();

      Swal.fire({
        title: "¡Eeliminado!",
        text: result.message || "El evento ha sido eliminado permanentemente",
        icon: "success",
      });

      fetchEventos();
    } catch (err) {
      Swal.fire({
        title: "Error",
        text: "No se pudo eliminar el evento.",
        icon: "error",
      });
    }
  };

  const bulkLogicalDelete = async () => {
    if (selectedEventos.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Ningún evento seleccionado",
        text: "Por favor selecciona al menos un evento para desactivar",
      });
      return;
    }

    const result = await Swal.fire({
      title: "¿Desactivar eventos seleccionados?",
      text: `¿Desea desactivar los ${selectedEventos.length} eventos seleccionados?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#BF8D6B",
      cancelButtonColor: "#d33",
      confirmButtonText: `Sí, desactivar (${selectedEventos.length})`,
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        Swal.fire({
          title: "Procesando...",
          text: "Desactivando eventos seleccionados",
          allowOutsideClick: false,
          allowEscapeKey: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        const updatePromises = selectedEventos.map((id) =>
          fetch(`${API_URL}/api/evento/${id}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
          })
        );

        await Promise.all(updatePromises);

        Swal.fire({
          title: "¡Completado!",
          text: "Los eventos seleccionados han sido desactivados",
          icon: "success",
          confirmButtonText: "OK",
        });

        fetchEventos();
        setSelectedEventos([]);
      } catch (err) {
        console.error("Error al desactivar eventos:", err);
        Swal.fire({
          title: "Error",
          text: "No se pudieron desactivar los eventos seleccionados.",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    }
  };

  const bulkPhysicalDelete = async () => {
    if (selectedEventos.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Ningún evento seleccionado",
        text: "Por favor selecciona al menos un evento para eliminar",
      });
      return;
    }

    const result = await Swal.fire({
      title: "¿Eliminar permanentemente?",
      text: `¿Desea eliminar permanentemente los ${selectedEventos.length} eventos seleccionados? Esta acción no se puede deshacer.`,
      icon: "error",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#BF8D6B",
      confirmButtonText: `Sí, eliminar (${selectedEventos.length})`,
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      const secondConfirm = await Swal.fire({
        title: "¿Está completamente seguro?",
        html: `
        <div class="text-left">
          <p>No podrá recuperar estos ${selectedEventos.length} eventos después de eliminarlos.</p>
          <p class="text-red-500 font-bold mt-2">Esta acción es IRREVERSIBLE.</p>
        </div>
      `,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#BF8D6B",
        confirmButtonText: "Sí, eliminar definitivamente",
        cancelButtonText: "Cancelar",
      });

      if (!secondConfirm.isConfirmed) return;

      try {
        Swal.fire({
          title: "Procesando...",
          text: "Eliminando eventos seleccionados",
          allowOutsideClick: false,
          allowEscapeKey: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        const deletePromises = selectedEventos.map((id) =>
          fetch(`${API_URL}/api/evento/${id}`, {
            method: "DELETE",
          })
        );

        await Promise.all(deletePromises);

        Swal.fire({
          title: "¡Eeliminados!",
          text: "Los eventos seleccionados han sido eliminados permanentemente",
          icon: "success",
          confirmButtonText: "OK",
        });

        fetchEventos();
        setSelectedEventos([]);
      } catch (err) {
        console.error("Error al eliminar eventos:", err);
        Swal.fire({
          title: "Error",
          text: "No se pudieron eliminar los eventos seleccionados.",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    }
  };

  const handleEventoToggleActive = async (id, currentActiveState) => {
    const action = currentActiveState ? "desactivar" : "activar";

    const result = await Swal.fire({
      title: `¿${currentActiveState ? "Desactivar" : "Activar"} evento?`,
      text: `¿Desea ${action} este evento?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#BF8D6B",
      cancelButtonColor: "#d33",
      confirmButtonText: `Sí, ${action}`,
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`${API_URL}/api/evento/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ activo: !currentActiveState }),
        });

        if (!response.ok) {
          throw new Error(`Error al ${action} el evento`);
        }

        Swal.fire({
          title: "¡Completado!",
          text: `El evento ha sido ${action}do correctamente`,
          icon: "success",
          confirmButtonText: "OK",
          timer: 2000,
          showConfirmButton: false,
        });

        fetchEventos();
      } catch (err) {
        console.error(`Error al ${action} evento:`, err);
        Swal.fire({
          title: "Error",
          text: `No se pudo ${action} el evento.`,
          icon: "error",
          confirmButtonText: "OK",
        });
        setError(`No se pudo ${action} el evento.`);
      }
    }
  };

  const handleEditEvento = (evento) => {
    if (!evento?.id) {
      Swal.fire({
        title: "Error",
        text: "El evento seleccionado no tiene un ID válido.",
        icon: "error",
      });
      return;
    }
    setEventoEditar(evento);
    setShowEditModal(true);
  };

  const handleAddEntradas = (evento) => {
    if (!evento?.id) {
      Swal.fire({
        title: "Error",
        text: "El evento seleccionado no tiene un ID válido.",
        icon: "error",
      });
      return;
    }
    setEventoEntradas(evento);
    setShowEntradasModal(true);
  };

  const handleShowDetail = async (eventoId) => {
    setLoadingDetail(true);
    setShowDetailModal(true);
    setEntradasDetalle([]);
    try {
      const response = await fetch(`${API_URL}/api/evento/${eventoId}`);
      if (!response.ok)
        throw new Error("Error al obtener el detalle del evento");
      const result = await response.json();
      setEventoDetalle(result.data || result);

      setLoadingEntradas(true);
      const entradasRes = await fetch(`${API_URL}/api/entrada/${eventoId}`);
      if (entradasRes.ok) {
        const entradasData = await entradasRes.json();
        setEntradasDetalle(
          Array.isArray(entradasData.data) ? entradasData.data : []
        );
      } else {
        setEntradasDetalle([]);
      }
    } catch (err) {
      setEventoDetalle({ error: err.message });
      setEntradasDetalle([]);
    } finally {
      setLoadingDetail(false);
      setLoadingEntradas(false);
    }
  };

  const totalPages = Math.ceil(eventosFiltrados.length / itemsPerPage);
  const currentItems = eventosFiltrados.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (!isClient) return null;

  if (loading) {
    return (
      <div className="p-2 md:p-4 bg-gray-900 min-h-screen">
        <Header title="Eventos" />
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-300">Cargando eventos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 md:p-4 ">
      <Header />

      <div className="mb-4 space-y-10">
        <div className="flex flex-col md:flex-row md:items-center gap-2 w-full">
          {/* Campo de búsqueda */}
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Buscar eventos..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full md:w-64 py-2 px-8 text-sm bg-black border-2 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent rounded-full"
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

          {/* Botones de filtro y acción */}
          <div className="flex flex-wrap gap-2 md:gap-2">
            {/* Botón para mostrar/ocultar filtros en móvil */}
            <div className="md:hidden w-full">
              <button
                className="w-full px-3 py-2 text-sm rounded flex items-center justify-center gap-1 transition-colors border-2 bg-black hover:text-black"
                style={{ borderColor: "#BF8D6B", color: "#ffffffff" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#BF8D6B";
                  e.currentTarget.style.color = "white";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "black";
                  e.currentTarget.style.color = "#ffffffff";
                }}
                onClick={() => setShowFilters(!showFilters)}
              >
                <ListFilter className="h-4 w-4" />
                <span>Filtros</span>
                {showFilters ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
            </div>

            {/* Contenedor de filtros (siempre visible en desktop, condicional en móvil) */}
            <div
              className={`${
                showFilters ? "flex" : "hidden"
              } md:flex flex-col md:flex-row gap-1 w-full md:w-auto`}
            >
              <button
                className={`px-3 py-2 text-sm rounded-l flex items-center justify-center gap-1 transition-colors border-2 ${
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
                onClick={() => {
                  setFilterMode("active");
                  setShowFilters(false);
                }}
              >
                <span className="text-xs md:text-sm">Activos</span>
              </button>
              <button
                className={`px-3 py-2 text-sm flex items-center justify-center gap-1 transition-colors border-2 ${
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
                onClick={() => {
                  setFilterMode("inactive");
                  setShowFilters(false);
                }}
              >
                <span className="text-xs md:text-sm">Inactivos</span>
              </button>
              <button
                className={`px-3 py-2 text-sm rounded-r flex items-center justify-center gap-1 transition-colors border-2 ${
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
                onClick={() => {
                  setFilterMode("all");
                  setShowFilters(false);
                }}
              >
                <span className="text-xs md:text-sm">Todos</span>
              </button>
            </div>

            <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto ml-auto">
              <div className="flex flex-col md:flex-row gap-2 w-full">
                <button
                  className="px-3 py-2 text-sm rounded flex items-center justify-center gap-1 transition-colors border-2 bg-black hover:text-black w-full md:w-auto"
                  style={{ borderColor: "#BF8D6B", color: "#ffffffff" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#BF8D6B";
                    e.currentTarget.style.color = "white";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "black";
                    e.currentTarget.style.color = "#ffffffff";
                  }}
                  onClick={bulkLogicalDelete}
                  disabled={selectedEventos.length === 0}
                >
                  <span className="text-xs md:text-sm">Desactivar</span>
                </button>

                <button
                  className="px-3 py-2 text-sm rounded flex items-center justify-center gap-1 transition-colors border-2 bg-black hover:text-black w-full md:w-auto"
                  style={{ borderColor: "#BF8D6B", color: "#ffffffff" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#BF8D6B";
                    e.currentTarget.style.color = "white";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "black";
                    e.currentTarget.style.color = "#ffffffff";
                  }}
                  onClick={bulkPhysicalDelete}
                  disabled={selectedEventos.length === 0}
                >
                  <span className="text-xs md:text-sm">Eliminar</span>
                </button>
              </div>

              <button
                className="px-3 py-2 text-sm rounded flex items-center justify-center gap-1 transition-colors border-2 bg-black hover:text-black w-full md:w-auto"
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
                <span className="text-xs md:text-sm">Agregar</span>
              </button>

              <button
                className="px-3 py-2 text-sm rounded flex items-center justify-center gap-1 transition-colors border-2 bg-black hover:text-black w-full md:w-auto"
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
                <span className="text-xs md:text-sm">Imágenes</span>
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <div className="hidden md:block">
            <table className="min-w-full bg-gray-800 rounded-lg overflow-hidden">
              <thead className="bg-gray-900">
                <tr>
                  <th className="w-8 px-3 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={
                        selectedEventos.length === currentItems.length &&
                        currentItems.length > 0
                      }
                      onChange={toggleAllSelection}
                      className="w-4 h-4 bg-gray-700 border-gray-600 rounded"
                      style={{ accentColor: "#BF8D6B" }}
                    />
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Nombre del Evento
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Salón
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Fecha y Hora
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Duración
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Capacidad
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Estado
                  </th>
                  {currentItems.length > 0 && (
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-52">
                      Acciones
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {currentItems.length > 0 ? (
                  currentItems.map((evento, index) => (
                    <tr
                      key={evento.id}
                      className={`${
                        index % 2 === 0 ? "bg-gray-800" : "bg-gray-750"
                      } ${
                        !evento.activo ? "opacity-70" : ""
                      } hover:bg-gray-700 transition-colors group`}
                    >
                      <td className="px-3 py-3">
                        <input
                          type="checkbox"
                          checked={selectedEventos.includes(evento.id)}
                          onChange={() => toggleEventoSelection(evento.id)}
                          className="w-4 h-4 bg-gray-700 border-gray-600 rounded"
                          style={{ accentColor: "#BF8D6B" }}
                        />
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-200">
                        {evento.nombre}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-200">
                        {evento.descripcion}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-200">
                        {evento.salon}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-200">
                        {formatDateTime(evento.fecha)}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-200">
                        {evento.duracion || "N/A"} minutos
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-200">
                        {evento.capacidad || "Sin límite"}
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            evento.activo
                              ? "text-white"
                              : "bg-red-900 text-red-200"
                          }`}
                          style={
                            evento.activo ? { backgroundColor: "#BF8D6B" } : {}
                          }
                        >
                          {evento.activo ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      {currentItems.length > 0 && (
                        <td className="px-3 py-3">
                          <div className="flex gap-1 flex-wrap opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              className="px-2 py-1 rounded transition-colors border-2 bg-black hover:text-black text-xs"
                              style={{
                                borderColor: "#BF8D6B",
                                color: "#BF8D6B",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  "#BF8D6B";
                                e.currentTarget.style.color = "white";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = "black";
                                e.currentTarget.style.color = "#BF8D6B";
                              }}
                              onClick={() => handleAddEntradas(evento)}
                              title="Agregar Entradas"
                            >
                              Entradas
                            </button>
                            <button
                              className="px-2 py-1 rounded transition-colors border-2 bg-black hover:text-black text-xs"
                              style={{
                                borderColor: "#BF8D6B",
                                color: "#BF8D6B",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  "#BF8D6B";
                                e.currentTarget.style.color = "white";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = "black";
                                e.currentTarget.style.color = "#BF8D6B";
                              }}
                              onClick={() => handleEditEvento(evento)}
                              title="Editar"
                            >
                              Editar
                            </button>
                            <button
                              className="px-2 py-1 rounded transition-colors border-2 text-xs"
                              style={{
                                color: "#BF8D6B",
                                borderColor: "#BF8D6B",
                              }}
                              onClick={() => handlePhysicalDelete(evento.id)}
                              title="Eliminar permanentemente"
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  "#BF8D6B";
                                e.currentTarget.style.color = "white";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  "transparent";
                                e.currentTarget.style.color = "#BF8D6B";
                              }}
                            >
                              Borrar
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="9"
                      className="text-center py-10 text-gray-400 text-sm"
                    >
                      No se encontraron eventos que coincidan con los criterios
                      de búsqueda
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-2">
            {currentItems.length > 0 ? (
              currentItems.map((evento) => (
                <div
                  key={evento.id}
                  className="bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedEventos.includes(evento.id)}
                        onChange={() => toggleEventoSelection(evento.id)}
                        className="w-4 h-4 bg-gray-700 border-gray-600 rounded mr-1"
                        style={{ accentColor: "#BF8D6B" }}
                      />
                      <div>
                        <div className="font-medium text-sm text-gray-200">
                          {evento.nombre}
                        </div>
                        <div className="text-sm text-gray-400">
                          {evento.salon}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        setExpandedEvento(
                          expandedEvento === evento.id ? null : evento.id
                        )
                      }
                      className="text-gray-400 hover:text-gray-300 flex items-center gap-1 text-sm transition-colors"
                    >
                      {expandedEvento === evento.id ? (
                        <>
                          <span>Cerrar</span>
                          <ChevronUp className="h-3 w-3" />
                        </>
                      ) : (
                        <>
                          <span>Detalles</span>
                          <ChevronDown className="h-3 w-3" />
                        </>
                      )}
                    </button>
                  </div>

                  {expandedEvento === evento.id && (
                    <div className="mt-3 space-y-2 pt-3 border-t border-gray-700">
                      <div className="grid grid-cols-1 gap-2">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-gray-400 text-sm">
                            Duración:
                          </span>
                          <span className="ml-2 text-gray-200">
                            {evento.duracion || "N/A"} minutos
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-gray-400 text-sm">
                            Capacidad:
                          </span>
                          <span className="ml-2 text-gray-200">
                            {evento.capacidad || "Sin límite"}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-gray-400 text-sm">Fecha:</span>
                          <span className="ml-2 text-gray-200">
                            {formatDateTime(evento.fecha)}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-gray-400 text-sm">Estado:</span>
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full w-fit mt-1 ml-2 ${
                              evento.activo
                                ? "text-white"
                                : "bg-red-900 text-red-200"
                            }`}
                            style={
                              evento.activo
                                ? { backgroundColor: "#BF8D6B" }
                                : {}
                            }
                          >
                            {evento.activo ? "Activo" : "Inactivo"}
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-between pt-2 mt-2 border-t border-gray-700">
                        <div className="grid grid-cols-3 gap-2 w-full">
                          <button
                            className="p-2 rounded transition-colors flex items-center justify-center border-2 bg-black hover:text-black text-xs"
                            style={{ borderColor: "#BF8D6B", color: "#BF8D6B" }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "#BF8D6B";
                              e.currentTarget.style.color = "black";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "black";
                              e.currentTarget.style.color = "#BF8D6B";
                            }}
                            onClick={() => handleEditEvento(evento)}
                            title="Editar"
                          >
                            Editar
                          </button>
                          <button
                            className="p-2 rounded transition-colors flex items-center justify-center border-2 bg-black hover:text-black text-xs"
                            style={{ borderColor: "#BF8D6B", color: "#BF8D6B" }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "#BF8D6B";
                              e.currentTarget.style.color = "black";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "black";
                              e.currentTarget.style.color = "#BF8D6B";
                            }}
                            onClick={() => handleAddEntradas(evento)}
                            title="Agregar Entradas"
                          >
                            Entradas
                          </button>
                          <button
                            className="p-2 rounded transition-colors flex items-center justify-center border-2 text-xs"
                            style={{ color: "#BF8D6B", borderColor: "#BF8D6B" }}
                            onClick={() => handlePhysicalDelete(evento.id)}
                            title="Eliminar permanentemente"
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "#BF8D6B";
                              e.currentTarget.style.color = "white";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "black";
                              e.currentTarget.style.color = "#BF8D6B";
                            }}
                          >
                            Borrar
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-10 border border-gray-700 rounded-lg">
                <p className="text-gray-400 text-sm">
                  No se encontraron eventos que coincidan con los criterios de
                  búsqueda
                </p>
              </div>
            )}
          </div>
        </div>

        {eventosFiltrados.length === 0 && !loading && (
          <div className="text-center py-8">
            <p className="text-gray-400 text-sm">No se encontraron eventos</p>
          </div>
        )}

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

        {showModal && (
          <EventoModal
            onClose={() => setShowModal(false)}
            onEventoAdded={handleEventoAdded}
          />
        )}

        {showEditModal && eventoEditar && (
          <EventoEditarModal
            evento={eventoEditar}
            onClose={() => {
              setShowEditModal(false);
              setEventoEditar(null);
            }}
            onEventoUpdated={handleEventoUpdated}
          />
        )}
        {showEntradasModal && eventoEntradas && (
          <EntradasModal
            evento={eventoEntradas}
            onClose={() => {
              setShowEntradasModal(false);
              setEventoEntradas(null);
            }}
          />
        )}
        {showUploadModal && (
          <UploadImageModal
            onClose={() => setShowUploadModal(false)}
            API_URL={`${API_URL}/api/upload/image`}
          />
        )}

        {showDetailModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-[#1a1a1a] rounded-lg p-4 w-full max-w-3xl shadow-lg max-h-[90vh] flex flex-col">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Info className="h-5 w-5 text-[#BF8D6B]" /> Detalle del Evento
                </h2>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setEventoDetalle(null);
                    setEntradasDetalle([]);
                  }}
                  className="text-gray-400 hover:text-white"
                  aria-label="Cerrar"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="overflow-y-auto" style={{ maxHeight: "65vh" }}>
                {loadingDetail ? (
                  <div className="text-center py-6 text-gray-300 text-sm">
                    Cargando detalle...
                  </div>
                ) : eventoDetalle?.error ? (
                  <div className="p-2 bg-red-900/50 text-red-300 text-xs rounded border border-red-700 mb-3">
                    {eventoDetalle.error}
                  </div>
                ) : eventoDetalle ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-white">
                    <div className="space-y-3">
                      {(eventoDetalle.image || eventoDetalle.imagen) && (
                        <div>
                          <span className="block text-sm text-[#BF8D6B] mb-1">
                            Imagen
                          </span>
                          <div className="p-2 bg-transparent rounded border border-[#BF8D6B] flex justify-center">
                            <img
                              src={eventoDetalle.image || eventoDetalle.imagen}
                              alt="Imagen del evento"
                              className="max-h-40 rounded"
                              style={{ maxWidth: "100%", objectFit: "contain" }}
                            />
                          </div>
                        </div>
                      )}
                      <div>
                        <span className="block text-sm text-[#BF8D6B] mb-1">
                          Nombre
                        </span>
                        <div className="p-2 bg-transparent rounded border border-[#BF8D6B] text-sm">
                          {eventoDetalle.nombre}
                        </div>
                      </div>
                      <div>
                        <span className="block text-sm text-[#BF8D6B] mb-1">
                          Descripción
                        </span>
                        <div className="p-2 bg-transparent rounded border border-[#BF8D6B] text-sm">
                          {eventoDetalle.descripcion}
                        </div>
                      </div>
                      <div>
                        <span className="block text-sm text-[#BF8D6B] mb-1">
                          Salón
                        </span>
                        <div className="p-2 bg-transparent rounded border border-[#BF8D6B] text-sm">
                          {eventoDetalle.salonNombre || eventoDetalle.salon}
                        </div>
                      </div>
                      <div>
                        <span className="block text-sm text-[#BF8D6B] mb-1">
                          Fecha
                        </span>
                        <div className="p-2 bg-transparent rounded border border-[#BF8D6B] text-sm">
                          {formatDateTime(eventoDetalle.fecha)}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <span className="block text-sm text-[#BF8D6B] mb-1">
                          Duración
                        </span>
                        <div className="p-2 bg-transparent rounded border border-[#BF8D6B] text-sm">
                          {eventoDetalle.duracion} minutos
                        </div>
                      </div>
                      <div>
                        <span className="block text-sm text-[#BF8D6B] mb-1">
                          Capacidad
                        </span>
                        <div className="p-2 bg-transparent rounded border border-[#BF8D6B] text-sm">
                          {eventoDetalle.capacidad}
                        </div>
                      </div>
                      <div>
                        <span className="block text-sm text-[#BF8D6B] mb-1">
                          Estado
                        </span>
                        <div className="p-2 bg-transparent rounded border border-[#BF8D6B] text-sm">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              eventoDetalle.activo
                                ? "text-white"
                                : "bg-red-900 text-red-200"
                            }`}
                            style={
                              eventoDetalle.activo
                                ? { backgroundColor: "#BF8D6B" }
                                : {}
                            }
                          >
                            {eventoDetalle.activo ? "Activo" : "Inactivo"}
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="block text-sm text-[#BF8D6B] mb-1">
                          Entradas
                        </span>
                        <div className="p-2 bg-transparent rounded border border-[#BF8D6B] max-h-32 overflow-y-auto">
                          {loadingEntradas ? (
                            <span className="text-gray-300 text-xs">
                              Cargando entradas...
                            </span>
                          ) : entradasDetalle.length === 0 ? (
                            <span className="text-gray-400 text-xs">
                              No hay entradas para este evento.
                            </span>
                          ) : (
                            <ul className="space-y-2">
                              {entradasDetalle.map((entrada, idx) => (
                                <li
                                  key={entrada.id || idx}
                                  className="text-gray-200 text-xs border-b border-gray-700 pb-2 last:border-b-0"
                                >
                                  <div>
                                    <span className="font-semibold text-[#BF8D6B]">
                                      Tipo:
                                    </span>{" "}
                                    {entrada.tipo_entrada}
                                  </div>
                                  <div>
                                    <span className="font-semibold text-[#BF8D6B]">
                                      Precio:
                                    </span>{" "}
                                    ${entrada.precio}
                                  </div>
                                  <div>
                                    <span className="font-semibold text-[#BF8D6B]">
                                      Cantidad:
                                    </span>{" "}
                                    {entrada.cantidad}
                                  </div>
                                  <div>
                                    <span className="font-semibold text-[#BF8D6B]">
                                      Estatus:
                                    </span>{" "}
                                    {entrada.estatus}
                                  </div>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-300 text-sm">
                    No hay información para mostrar.
                  </div>
                )}
              </div>
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setEventoDetalle(null);
                    setEntradasDetalle([]);
                  }}
                  className="font-bold py-2 px-2 rounded bg-transparent text-white border border-[#BF8D6B] text-sm"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
