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
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMode, setFilterMode] = useState("active");
  const [selectedEventos, setSelectedEventos] = useState([]);
  const [eventoEditar, setEventoEditar] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedEvento, setExpandedEvento] = useState(null);
  const [showEntradasModal, setShowEntradasModal] = useState(false);
  const [eventoEntradas, setEventoEntradas] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [eventoDetalle, setEventoDetalle] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [entradasDetalle, setEntradasDetalle] = useState([]);
  const [loadingEntradas, setLoadingEntradas] = useState(false);

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
          console.log("Fecha original de BD:", evento.fecha);
          console.log("Fecha formateada:", formatDateTime(evento.fecha));

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

      // Parsear la fecha manteniendo la hora exacta de la BD
      const date = new Date(dateString);

      // Extraer componentes UTC directamente
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

    // Usar componentes UTC para el input
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
        title: "¡Eliminado!",
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
      confirmButtonColor: "#3085d6",
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
      cancelButtonColor: "#3085d6",
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
        cancelButtonColor: "#3085d6",
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
          title: "¡Eliminados!",
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
      confirmButtonColor: "#3085d6",
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
      <div className="p-4 md:p-6">
        <Header title="Eventos" />
        <div className="flex justify-center items-center h-64">
          <p>Cargando eventos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <Header title="Eventos" />

      <div className="mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="relative w-full md:w-1/3 lg:w-3/4 mb-4">
            <input
              type="text"
              placeholder="    Buscar eventos..."
              value={searchTerm}
              onChange={handleSearch}
              className="search-input pl-10 w-full"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          </div>

          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <button
              className={`btn ${
                filterMode === "active" ? "btn-warning" : "btn-outline"
              } flex items-center gap-2 flex-1 md:flex-none`}
              onClick={() => setFilterMode("active")}
            >
              <Eye className="h-4 w-4" />
              <span className="hidden sm:inline">Activos</span>
            </button>
            <button
              className={`btn ${
                filterMode === "inactive" ? "btn-warning" : "btn-outline"
              } flex items-center gap-2 flex-1 md:flex-none`}
              onClick={() => setFilterMode("inactive")}
            >
              <EyeOff className="h-4 w-4" />
              <span className="hidden sm:inline">Inactivos</span>
            </button>
            <button
              className={`btn ${
                filterMode === "all" ? "btn-warning" : "btn-outline"
              } flex items-center gap-2 flex-1 md:flex-none`}
              onClick={() => setFilterMode("all")}
            >
              <ListFilter className="h-4 w-4" />
              <span className="hidden sm:inline">Todos</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          {selectedEventos.length > 0 && (
            <>
              <button
                className="btn btn-warning flex items-center gap-2 w-full md:w-auto"
                onClick={bulkLogicalDelete}
              >
                <Archive className="h-4 w-4" />
                Desactivar {selectedEventos.length}
              </button>
              <button
                className="btn btn-error flex items-center gap-2 w-full md:w-auto"
                onClick={bulkPhysicalDelete}
              >
                <Trash2 className="h-4 w-4" />
                Eliminar {selectedEventos.length}
              </button>
            </>
          )}

          <button
            className="btn btn-primary flex items-center gap-2 w-full md:w-auto"
            onClick={() => setShowModal(true)}
          >
            <Plus className="h-4 w-4" />
            Agregar evento
          </button>
          <button
            className="btn btn-secondary flex items-center gap-2 w-full md:w-auto"
            onClick={() => setShowUploadModal(true)}
          >
            <Plus className="h-4 w-4" />
            Cargar imágenes
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <div className="hidden md:block">
          <table className="table min-w-full">
            <thead>
              <tr>
                <th className="w-10">
                  <input
                    type="checkbox"
                    checked={
                      selectedEventos.length === currentItems.length &&
                      currentItems.length > 0
                    }
                    onChange={toggleAllSelection}
                  />
                </th>
                <th>Nombre del Evento</th>
                <th>Descripción</th>
                <th>Salón</th>
                <th>Fecha y Hora</th>
                <th>Duración</th>
                <th>Capacidad</th>
                <th>Estado</th>
                {currentItems.length > 0 && <th className="w-52">Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((evento) => (
                  <tr
                    key={evento.id}
                    className={!evento.activo ? "opacity-70 bg-gray-50" : ""}
                  >
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedEventos.includes(evento.id)}
                        onChange={() => toggleEventoSelection(evento.id)}
                      />
                    </td>
                    <td>{evento.nombre}</td>
                    <td>{evento.descripcion}</td>
                    <td>{evento.salon}</td>
                    <td>{formatDateTime(evento.fecha)}</td>
                    <td>{evento.duracion || "N/A"} minutos</td>
                    <td>{evento.capacidad || "Sin límite"}</td>
                    <td>
                      <span
                        className={`badge ${
                          evento.activo ? "badge-success" : "badge-error"
                        }`}
                      >
                        {evento.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    {currentItems.length > 0 && (
                      <td>
                        <div className="flex gap-2 flex-wrap">
                          <button
                            className="btn btn-sm btn-outline btn-primary p-1"
                            onClick={() => handleEditEvento(evento)}
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            className="btn btn-sm btn-outline btn-info p-1"
                            onClick={() => handleShowDetail(evento.id)}
                            title="Detalle"
                          >
                            <Info className="h-4 w-4" />
                          </button>
                          <button
                            className="btn btn-sm btn-outline btn-info p-1"
                            onClick={() => handleAddEntradas(evento)}
                            title="Agregar Entradas"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                          {evento.activo ? (
                            <button
                              className="btn btn-sm btn-outline btn-warning p-1"
                              onClick={() => handleLogicalDelete(evento.id)}
                              title="Desactivar"
                            >
                              <Archive className="h-4 w-4" />
                            </button>
                          ) : (
                            <button
                              className="btn btn-sm btn-outline btn-success p-1"
                              onClick={() =>
                                handleEventoToggleActive(
                                  evento.id,
                                  evento.activo
                                )
                              }
                              title="Activar"
                            >
                              <Power className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            className="btn btn-sm btn-outline btn-error p-1"
                            onClick={() => handlePhysicalDelete(evento.id)}
                            title="Eliminar permanentemente"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="text-center py-10">
                    <p className="text-gray-500">
                      No se encontraron eventos que coincidan con los criterios
                      de búsqueda
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="md:hidden space-y-4">
          {currentItems.length > 0 ? (
            currentItems.map((evento) => (
              <div
                key={evento.id}
                className="border rounded-lg shadow-sm overflow-hidden mb-3"
              >
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedEventos.includes(evento.id)}
                          onChange={() => toggleEventoSelection(evento.id)}
                          className="mr-1"
                        />
                        <div>
                          <div className="font-medium text-lg">
                            {evento.nombre}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            {evento.salon}
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span className="truncate">
                          {formatDateTime(evento.fecha)}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span
                        className={`badge ${
                          evento.activo ? "badge-success" : "badge-error"
                        } mb-2`}
                      >
                        {evento.activo ? "Activo" : "Inactivo"}
                      </span>
                      <button
                        onClick={() =>
                          setExpandedEvento(
                            expandedEvento === evento.id ? null : evento.id
                          )
                        }
                        className="text-gray-500 flex items-center gap-1"
                      >
                        {expandedEvento === evento.id ? (
                          <>
                            <span className="text-xs">Cerrar</span>
                            <ChevronUp className="h-4 w-4" />
                          </>
                        ) : (
                          <>
                            <span className="text-xs">Detalles</span>
                            <ChevronDown className="h-4 w-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {expandedEvento === evento.id && (
                    <div className="mt-4 space-y-3 overflow-x-hidden">
                      <div className="grid grid-cols-1 gap-2">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-gray-500 mr-2" />
                          <span className="text-gray-500 text-sm">
                            Duración:
                          </span>
                          <span className="ml-2">
                            {evento.duracion || "N/A"} minutos
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 text-gray-500 mr-2" />
                          <span className="text-gray-500 text-sm">
                            Capacidad:
                          </span>
                          <span className="ml-2">
                            {evento.capacidad || "Sin límite"}
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-between pt-3 mt-2 border-t">
                        <div className="grid grid-cols-2 gap-2 w-full">
                          <button
                            className="btn btn-sm btn-outline btn-primary flex items-center justify-center"
                            onClick={() => handleEditEvento(evento)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            <span className="text-xs">Editar</span>
                          </button>
                          <button
                            className="btn btn-sm btn-outline btn-info flex items-center justify-center"
                            onClick={() => handleShowDetail(evento.id)}
                          >
                            <Info className="h-4 w-4 mr-1" />
                            <span className="text-xs">Detalle</span>
                          </button>
                          <button
                            className="btn btn-sm btn-outline btn-info flex items-center justify-center"
                            onClick={() => handleAddEntradas(evento)}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            <span className="text-xs">Entradas</span>
                          </button>
                          {evento.activo ? (
                            <button
                              className="btn btn-sm btn-outline btn-warning flex items-center justify-center"
                              onClick={() => handleLogicalDelete(evento.id)}
                            >
                              <Archive className="h-4 w-4 mr-1" />
                              <span className="text-xs">Desactivar</span>
                            </button>
                          ) : (
                            <button
                              className="btn btn-sm btn-outline btn-success flex items-center justify-center"
                              onClick={() =>
                                handleEventoToggleActive(
                                  evento.id,
                                  evento.activo
                                )
                              }
                            >
                              <Power className="h-4 w-4 mr-1" />
                              <span className="text-xs">Activar</span>
                            </button>
                          )}
                          <button
                            className="btn btn-sm btn-outline btn-error flex items-center justify-center"
                            onClick={() => handlePhysicalDelete(evento.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            <span className="text-xs">Eliminar</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 border rounded-lg">
              <p className="text-gray-500">
                No se encontraron eventos que coincidan con los criterios de
                búsqueda
              </p>
            </div>
          )}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="pagination mt-6 flex flex-wrap justify-center gap-2">
          {currentPage > 1 && (
            <button
              className="btn btn-sm btn-outline"
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              <ChevronRight className="h-4 w-4 rotate-180" />
            </button>
          )}
          {[...Array(totalPages)].map((_, index) => {
            if (
              index === 0 ||
              index === totalPages - 1 ||
              (index >= currentPage - 2 && index <= currentPage + 0)
            ) {
              return (
                <button
                  key={index}
                  className={`btn btn-sm ${
                    currentPage === index + 1 ? "btn-primary" : "btn-outline"
                  }`}
                  onClick={() => setCurrentPage(index + 1)}
                >
                  {index + 1}
                </button>
              );
            } else if (
              (index === currentPage - 3 && currentPage > 3) ||
              (index === currentPage + 1 && currentPage < totalPages - 2)
            ) {
              return (
                <span
                  key={index}
                  className="flex items-center justify-center px-2"
                >
                  ...
                </span>
              );
            }
            return null;
          })}
          {currentPage < totalPages && (
            <button
              className="btn btn-sm btn-outline"
              onClick={() => setCurrentPage(currentPage + 1)}
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
          <div className="bg-gray-800 rounded-lg border-2 border-yellow-600 p-6 w-full max-w-3xl shadow-lg shadow-yellow-800/20 relative max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Info className="h-5 w-5 text-yellow-400" /> Detalle del Evento
              </h2>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setEventoDetalle(null);
                  setEntradasDetalle([]);
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
              ) : eventoDetalle?.error ? (
                <div className="mb-4 p-3 bg-red-900/50 text-red-300 text-sm rounded-lg border border-red-700">
                  {eventoDetalle.error}
                </div>
              ) : eventoDetalle ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white">
                  <div className="space-y-4">
                    {(eventoDetalle.image || eventoDetalle.imagen) && (
                      <div>
                        <span className="block text-sm text-yellow-400 mb-1">
                          Imagen
                        </span>
                        <div className="p-3 bg-gray-700 rounded-lg border border-yellow-600 flex justify-center">
                          <img
                            src={eventoDetalle.image || eventoDetalle.imagen}
                            alt="Imagen del evento"
                            className="max-h-48 rounded shadow"
                            style={{ maxWidth: "100%", objectFit: "contain" }}
                          />
                        </div>
                      </div>
                    )}
                    <div>
                      <span className="block text-sm text-yellow-400 mb-1">
                        Nombre
                      </span>
                      <div className="p-3 bg-gray-700 rounded-lg border border-yellow-600">
                        {eventoDetalle.nombre}
                      </div>
                    </div>
                    <div>
                      <span className="block text-sm text-yellow-400 mb-1">
                        Descripción
                      </span>
                      <div className="p-3 bg-gray-700 rounded-lg border border-yellow-600">
                        {eventoDetalle.descripcion}
                      </div>
                    </div>
                    <div>
                      <span className="block text-sm text-yellow-400 mb-1">
                        Salón
                      </span>
                      <div className="p-3 bg-gray-700 rounded-lg border border-yellow-600">
                        {eventoDetalle.salonNombre || eventoDetalle.salon}
                      </div>
                    </div>
                    <div>
                      <span className="block text-sm text-yellow-400 mb-1">
                        Fecha
                      </span>
                      <div className="p-3 bg-gray-700 rounded-lg border border-yellow-600">
                        {formatDateTime(eventoDetalle.fecha)}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <span className="block text-sm text-yellow-400 mb-1">
                        Duración
                      </span>
                      <div className="p-3 bg-gray-700 rounded-lg border border-yellow-600">
                        {eventoDetalle.duracion} minutos
                      </div>
                    </div>
                    <div>
                      <span className="block text-sm text-yellow-400 mb-1">
                        Capacidad
                      </span>
                      <div className="p-3 bg-gray-700 rounded-lg border border-yellow-600">
                        {eventoDetalle.capacidad}
                      </div>
                    </div>
                    <div>
                      <span className="block text-sm text-yellow-400 mb-1">
                        Estado
                      </span>
                      <div className="p-3 bg-gray-700 rounded-lg border border-yellow-600">
                        <span
                          className={`badge ${
                            eventoDetalle.activo
                              ? "badge-success"
                              : "badge-error"
                          }`}
                        >
                          {eventoDetalle.activo ? "Activo" : "Inactivo"}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="block text-sm text-yellow-400 mb-1">
                        Entradas
                      </span>
                      <div className="p-3 bg-gray-700 rounded-lg border border-yellow-600 max-h-40 overflow-y-auto">
                        {loadingEntradas ? (
                          <span className="text-gray-300">
                            Cargando entradas...
                          </span>
                        ) : entradasDetalle.length === 0 ? (
                          <span className="text-gray-400">
                            No hay entradas para este evento.
                          </span>
                        ) : (
                          <ul className="list-disc pl-4 space-y-2">
                            {entradasDetalle.map((entrada, idx) => (
                              <li
                                key={entrada.id || idx}
                                className="text-gray-200"
                              >
                                <div>
                                  <span className="font-semibold">
                                    Tipo de entrada:
                                  </span>{" "}
                                  {entrada.tipo_entrada}
                                </div>
                                <div>
                                  <span className="font-semibold">Precio:</span>{" "}
                                  ${entrada.precio}
                                </div>
                                <div>
                                  <span className="font-semibold">
                                    Cantidad:
                                  </span>{" "}
                                  {entrada.cantidad}
                                </div>
                                <div>
                                  <span className="font-semibold">
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
                <div className="text-gray-300">
                  No hay información para mostrar.
                </div>
              )}
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setEventoDetalle(null);
                  setEntradasDetalle([]);
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
