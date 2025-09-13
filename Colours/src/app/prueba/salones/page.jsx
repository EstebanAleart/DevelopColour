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
import SalonModal from "../components/salon-modal";
import SalonEditarModal from "../components/salon-editar-modal";
import Header from "../components/header";
import UploadImageModal from "../components/upload-image-modal";
import Swal from "sweetalert2";
import apiUrls from "@/app/components/utils/apiConfig";

const API_URL = apiUrls;

export default function Salones() {
  const [showModal, setShowModal] = useState(false);
  const [allSalones, setAllSalones] = useState([]);
  const [filteredSalones, setFilteredSalones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMode, setFilterMode] = useState("active");
  const [salonAEditar, setSalonAEditar] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedSalon, setExpandedSalon] = useState(null);
  const [selectedSalones, setSelectedSalones] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [salonDetalle, setSalonDetalle] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const itemsPerPage = 10;

  const removeAccents = (str) => {
    return str?.normalize("NFD").replace(/[\u0300-\u036f]/g, "") || "";
  };

  const fetchSalones = async (pageNum = 1, limitNum = 10, search = "") => {
    try {
      setLoading(true);
      let url = `${API_URL}/api/salon?page=${pageNum}&limit=100`;

      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }

      url += "&includeAll=true";

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      let salonesData = [];

      if (data.pagination) {
        salonesData = Array.isArray(data.data) ? data.data : [];
        setTotalPages(data.pagination.totalPages);
        setCurrentPage(data.pagination.page);
      } else {
        salonesData = Array.isArray(data)
          ? data
          : data.data
          ? data.data
          : data.salones
          ? data.salones
          : [data];
        setTotalPages(Math.ceil(salonesData.length / limitNum));
      }

      setAllSalones(salonesData);
      applyFilters(salonesData, search, filterMode);
    } catch (err) {
      setError(err.message);
      setAllSalones([]);
      setFilteredSalones([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (salones, search = searchTerm, mode = filterMode) => {
    let filtered = [...salones];

    if (search) {
      const searchLower = removeAccents(search.toLowerCase());
      filtered = filtered.filter((salon) => {
        const nombre = removeAccents(
          (salon.salon || salon.nombre || "").toLowerCase()
        );
        const contacto = removeAccents((salon.contacto || "").toLowerCase());
        const email = removeAccents((salon.email || "").toLowerCase());
        const whatsapp = (salon.whatsapp || "").toLowerCase();
        const cuit = (salon.cuit || "").toLowerCase();

        return (
          nombre.includes(searchLower) ||
          contacto.includes(searchLower) ||
          email.includes(searchLower) ||
          whatsapp.includes(searchLower) ||
          cuit.includes(searchLower)
        );
      });
    }

    if (mode === "active") {
      filtered = filtered.filter(
        (salon) =>
          salon.isActive === true ||
          salon.estatus === true ||
          salon.activo === true
      );
    } else if (mode === "inactive") {
      filtered = filtered.filter(
        (salon) =>
          salon.isActive === false ||
          salon.estatus === false ||
          salon.activo === false
      );
    }

    setFilteredSalones(filtered);
    setSelectedSalones([]);
  };

  useEffect(() => {
    fetchSalones(currentPage, itemsPerPage, searchTerm);
  }, []);

  useEffect(() => {
    if (allSalones.length > 0) {
      applyFilters(allSalones);
    }
  }, [filterMode]);

  const refreshSalones = async () => {
    await fetchSalones(currentPage, itemsPerPage, searchTerm);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleAddSalon = async (newSalon) => {
    try {
      const response = await fetch(`${API_URL}/api/salon`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newSalon),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error: ${response.status}`);
      }

      await refreshSalones();
      setShowModal(false);

      Swal.fire({
        icon: "success",
        title: "Salón creado",
        text: "El salón fue creado correctamente",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error al crear salón",
        text: error.message || "Hubo un error al crear el salón",
      });
    }
  };

  const handleUpdateSalon = async (updated) => {
    if (updated) {
      await refreshSalones();
      Swal.fire({
        icon: "success",
        title: "Salón actualizado",
        text: "El salón fue actualizado correctamente",
        timer: 2000,
        showConfirmButton: false,
      });
    }
    setSalonAEditar(null);
  };

  const handleDeleteSalon = async (id) => {
    const confirmResult = await Swal.fire({
      title: "¿Eliminar permanentemente?",
      text: "Esta acción no se puede deshacer. ¿Deseas continuar?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "##3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (confirmResult.isConfirmed) {
      try {
        const response = await fetch(`${API_URL}/api/salon/physical/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Error ${response.status}: ${errorText}`);
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.message || "Error al eliminar el salón");
        }

        Swal.fire("Eeliminado", data.message, "success");
        await refreshSalones();
      } catch (error) {
        Swal.fire("Error", error.message, "error");
      }
    }
  };

  const handleToggleSalonStatus = async (id, isCurrentlyActive) => {
    const newStatus = !isCurrentlyActive;
    const actionText = newStatus ? "activar" : "desactivar";

    const confirmResult = await Swal.fire({
      title: `¿${newStatus ? "Activar" : "Desactivar"} salón?`,
      text: `Estás a punto de ${actionText} este salón.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: `Sí, ${actionText}`,
      cancelButtonText: "Cancelar",
    });

    if (!confirmResult.isConfirmed) return;

    try {
      const response = await fetch(`${API_URL}/api/salon/toggle-status/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: newStatus }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || `Error al ${actionText} el salón`);
      }

      await refreshSalones();

      await Swal.fire({
        title: `Salón ${newStatus ? "activado" : "desactivado"}`,
        text: data.message,
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: error.message,
        icon: "error",
      });
    }
  };

  const handleSearch = (e) => {
    const searchValue = e.target.value;
    setSearchTerm(searchValue);
    setCurrentPage(1);
    applyFilters(allSalones, searchValue, filterMode);
  };

  const toggleSalonSelection = (id) => {
    setSelectedSalones((prev) =>
      prev.includes(id)
        ? prev.filter((salonId) => salonId !== id)
        : [...prev, id]
    );
  };

  const toggleAllSelection = () => {
    const currentPageItems = getCurrentPageItems();

    if (selectedSalones.length === currentPageItems.length) {
      setSelectedSalones([]);
    } else {
      setSelectedSalones(
        currentPageItems.map((salon) => salon.id || salon._id || salon.Id)
      );
    }
  };

  const bulkToggleStatus = async (activate) => {
    if (selectedSalones.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Ningún salón seleccionado",
        text: `Por favor selecciona al menos un salón para ${
          activate ? "activar" : "desactivar"
        }`,
      });
      return;
    }

    const result = await Swal.fire({
      title: `¿${activate ? "Activar" : "Desactivar"} salones seleccionados?`,
      text: `¿Desea ${activate ? "activar" : "desactivar"} los ${
        selectedSalones.length
      } salones seleccionados?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: activate ? "#3085d6" : "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: `Sí, ${activate ? "activar" : "desactivar"} (${
        selectedSalones.length
      })`,
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        Swal.fire({
          title: "Procesando...",
          text: `${
            activate ? "Activando" : "Desactivando"
          } salones seleccionados`,
          allowOutsideClick: false,
          allowEscapeKey: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        const updatePromises = selectedSalones.map((id) =>
          fetch(`${API_URL}/api/salon/toggle-status/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isActive: activate }),
          })
        );

        await Promise.all(updatePromises);

        Swal.fire({
          title: "¡Completado!",
          text: `Los salones seleccionados han sido ${
            activate ? "activados" : "desactivados"
          }`,
          icon: "success",
          confirmButtonText: "OK",
        });

        await refreshSalones();
        setSelectedSalones([]);
      } catch (err) {
        Swal.fire({
          title: "Error",
          text: `No se pudieron ${
            activate ? "activar" : "desactivar"
          } los salones seleccionados.`,
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    }
  };

  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredSalones.slice(startIndex, endIndex);
  };

  const currentItems = getCurrentPageItems();

  const handleFilterChange = (mode) => {
    setFilterMode(mode);
    setCurrentPage(1);
  };

  useEffect(() => {
    setTotalPages(Math.ceil(filteredSalones.length / itemsPerPage));
    if (currentPage > Math.ceil(filteredSalones.length / itemsPerPage)) {
      setCurrentPage(1);
    }
  }, [filteredSalones, itemsPerPage]);

  const handleShowDetail = async (salonId) => {
    setLoadingDetail(true);
    setShowDetailModal(true);
    try {
      const response = await fetch(`${API_URL}/api/salon/${salonId}`);
      if (!response.ok)
        throw new Error("Error al obtener el detalle del salón");
      const result = await response.json();
      setSalonDetalle(result.data || result);
    } catch (err) {
      setSalonDetalle({ error: err.message });
    } finally {
      setLoadingDetail(false);
    }
  };

  if (loading) {
    return (
      <div className="p-2 md:p-4 bg-gray-900 min-h-screen">
        <Header title="Salones" />
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-300">Cargando salones...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-2 md:p-4 bg-gray-900 min-h-screen">
        <Header title="Salones" />
        <div className="alert alert-error bg-red-900 border-red-700">
          <p className="text-red-200">Error: {error}</p>
          <button
            className="btn btn-sm btn-outline border-red-600 text-red-200 hover:bg-red-700 mt-2"
            onClick={() => fetchSalones()}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header />

      {/* Filtros y búsqueda - Reorganizados */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-2 w-full mb-4">
          {/* Campo de búsqueda */}
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Buscar por nombre, contacto, email, WhatsApp o CUIT..."
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

          {/* Botones de filtro y acción - ahora con más espacio */}
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
                  handleFilterChange("active");
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
                  handleFilterChange("inactive");
                  setShowFilters(false);
                }}
              >
                <span className="text-xs md:text-sm">Inactivos</span>
              </button>
              <button
                className={`px-3 py-2 text-sm rounded-r flex items-center justify-center gap-1 transition-colors border-2 ${
                  filterMode === "all"
                    ? "text-[#BF8D6B"
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
                  handleFilterChange("all");
                  setShowFilters(false);
                }}
              >
                <span className="text-xs md:text-sm">Todos</span>
              </button>
            </div>

            {/* Botones de acción principales */}
            <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto ml-auto">
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
                <span className="text-xs md:text-sm">Cargar imágenes</span>
              </button>
            </div>
          </div>
        </div>

        {/* Botones de acciones masivas */}
        {selectedSalones.length > 0 && (
          <div className="flex flex-col md:flex-row gap-2">
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
              onClick={() => bulkToggleStatus(true)}
            >
              <span className="text-xs md:text-sm">
                Activar {selectedSalones.length}
              </span>
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
              onClick={() => bulkToggleStatus(false)}
            >
              <span className="text-xs md:text-sm">
                Desactivar {selectedSalones.length}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Mensaje de estado del filtro */}
      <div className="mb-4 text-sm text-gray-400">
        {filteredSalones.length === 0 ? (
          <p>No se encontraron salones con los filtros actuales</p>
        ) : (
          <p>
            Mostrando {currentItems.length} de {filteredSalones.length} salones
            {filterMode === "active"
              ? " activos"
              : filterMode === "inactive"
              ? " inactivos"
              : ""}
            {searchTerm ? ` que coinciden con "${searchTerm}"` : ""}
          </p>
        )}
      </div>

      {/* Resto del código (tabla, paginación, modales) permanece igual */}
      {/* Tabla de salones */}
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
                      selectedSalones.length === currentItems.length &&
                      currentItems.length > 0
                    }
                    onChange={toggleAllSelection}
                    className="w-4 h-4 bg-gray-700 border-gray-600 rounded"
                    style={{ accentColor: "#BF8D6B" }}
                  />
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Salón
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  CUIT
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Nombre del Contacto
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Telefono
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Capacidad
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
              {currentItems.length > 0 ? (
                currentItems.map((salon, index) => {
                  const isActive = salon.isActive ?? salon.estatus ?? true;
                  const salonId = salon.id || salon._id || salon.Id;

                  return (
                    <tr
                      key={salonId}
                      className={`${
                        index % 2 === 0 ? "bg-gray-800" : "bg-gray-750"
                      } hover:bg-gray-700 transition-colors group ${
                        !isActive ? "opacity-70" : ""
                      }`}
                    >
                      <td
                        className="px-3 py-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={selectedSalones.includes(salonId)}
                          onChange={() => toggleSalonSelection(salonId)}
                          className="w-4 h-4 bg-gray-700 border-gray-600 rounded"
                          style={{ accentColor: "#BF8D6B" }}
                        />
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-200">
                        {salon.salon || salon.nombre}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-200">
                        {salon.cuit}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-200">
                        {salon.contacto || salon.nombre}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-200">
                        <a
                          href={`mailto:${salon.email}`}
                          className="text-[#BF8D6B] hover:underline"
                        >
                          {salon.email}
                        </a>
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-200">
                        {salon.whatsapp ? (
                          <a
                            href={`https://wa.me/${salon.whatsapp}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#BF8D6B] hover:underline"
                          >
                            {salon.whatsapp}
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-200">
                        {salon.capacidad || "N/A"}
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            isActive ? "text-white" : "bg-red-900 text-red-200"
                          }`}
                          style={isActive ? { backgroundColor: "#BF8D6B" } : {}}
                        >
                          {isActive ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            className="px-2 py-1 rounded transition-colors border-2 bg-black hover:text-black text-xs"
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
                              setSalonAEditar(salon);
                            }}
                            title="Editar"
                          >
                            Editar
                          </button>
                          <button
                            className="px-2 py-1 rounded transition-colors border-2 text-xs"
                            style={{ color: "#BF8D6B", borderColor: "#BF8D6B" }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSalon(salonId);
                            }}
                            title="Eliminar permanentemente"
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "#BF8D6B";
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
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="9" className="text-center py-10">
                    <p className="text-gray-400">
                      No se encontraron salones que coincidan con los criterios
                      de búsqueda
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Vista móvil mejorada */}
        <div className="md:hidden space-y-4">
          {currentItems.length > 0 ? (
            currentItems.map((salon) => {
              const isActive = salon.isActive ?? salon.estatus ?? true;
              const salonId = salon.id || salon._id || salon.Id;

              return (
                <div
                  key={salonId}
                  className="bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 flex items-start gap-2">
                      <input
                        type="checkbox"
                        checked={selectedSalones.includes(salonId)}
                        onChange={() => toggleSalonSelection(salonId)}
                        className="mt-1 w-4 h-4 bg-gray-700 border-gray-600 rounded"
                        style={{ accentColor: "#BF8D6B" }}
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-200 text-lg">
                          {salon.salon || salon.nombre}
                        </div>
                        <div className="text-sm text-gray-400 mt-1 flex items-center">
                          <span
                            className={`inline-block w-2 h-2 rounded-full mr-2 ${
                              isActive ? "bg-green-500" : "bg-red-500"
                            }`}
                          ></span>
                          <span>{isActive ? "Activo" : "Inactivo"}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        setExpandedSalon(
                          expandedSalon === salonId ? null : salonId
                        )
                      }
                      className="text-gray-400 flex items-center gap-1 ml-2"
                    >
                      {expandedSalon === salonId ? (
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

                  {/* Información básica siempre visible */}
                  <div className="mt-2 text-sm text-gray-400">
                    <div className="truncate">
                      <span className="font-medium">Contacto:</span>{" "}
                      {salon.contacto || "No especificado"}
                    </div>
                  </div>

                  {expandedSalon === salonId && (
                    <div className="mt-4 space-y-3 overflow-x-hidden">
                      <div className="grid grid-cols-1 gap-2">
                        <div className="flex flex-col">
                          <span className="text-gray-400 text-sm">CUIT:</span>
                          <span className="break-words text-gray-200">
                            {salon.cuit || "No especificado"}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-gray-400 text-sm">Email:</span>
                          <a
                            href={`mailto:${salon.email}`}
                            className="break-words text-[#BF8D6B] hover:underline"
                          >
                            {salon.email || "No especificado"}
                          </a>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-gray-400 text-sm">
                            WhatsApp:
                          </span>
                          {salon.whatsapp ? (
                            <a
                              href={`https://wa.me/${salon.whatsapp}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#BF8D6B] hover:underline"
                            >
                              {salon.whatsapp}
                            </a>
                          ) : (
                            <span className="text-gray-200">
                              No especificado
                            </span>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-gray-400 text-sm">
                            Capacidad:
                          </span>
                          <span className="text-gray-200">
                            {salon.capacidad || "No especificado"}
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-between pt-3 mt-2 border-t border-gray-700">
                        <div className="grid grid-cols-2 gap-2 w-full">
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
                            onClick={(e) => {
                              e.stopPropagation();
                              setSalonAEditar(salon);
                            }}
                          >
                            Editar
                          </button>
                          <button
                            className="p-2 rounded transition-colors flex items-center justify-center border-2 text-xs"
                            style={{ color: "#BF8D6B", borderColor: "#BF8D6B" }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSalon(salonId);
                            }}
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
              );
            })
          ) : (
            <div className="text-center py-10 border border-gray-700 rounded-lg">
              <p className="text-gray-400">
                No se encontraron salones que coincidan con los criterios de
                búsqueda
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-1">
          {currentPage > 1 && (
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
              onClick={() => handlePageChange(currentPage - 1)}
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
                  onClick={() => handlePageChange(index + 1)}
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
                  className="flex items-center justify-center px-2 text-gray-400"
                >
                  ...
                </span>
              );
            }
            return null;
          })}
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
              onClick={() => handlePageChange(currentPage + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      {/* Modales */}
      {showModal && (
        <SalonModal
          onClose={() => setShowModal(false)}
          onAddSalon={handleAddSalon}
          API_URL={`${API_URL}/api/salon`}
        />
      )}

      {salonAEditar && (
        <SalonEditarModal
          salon={salonAEditar}
          onClose={handleUpdateSalon}
          API_URL={`${API_URL}/api/salon`}
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
          <div className="bg-[#1a1a1a] rounded-lg p-5 w-full max-w-xl shadow-lg max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Info className="h-5 w-5 text-[#BF8D6B]" /> Detalle del Salón
              </h2>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSalonDetalle(null);
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
              ) : salonDetalle?.error ? (
                <div className="p-2 bg-red-900/50 text-red-300 text-xs rounded border border-red-700 mb-3">
                  {salonDetalle.error}
                </div>
              ) : salonDetalle ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white text-sm">
                  <div className="space-y-3">
                    {(salonDetalle.image || salonDetalle.imagen) && (
                      <div>
                        <span className="block text-xs text-[#BF8D6B] mb-1">
                          Imagen
                        </span>
                        <div className="p-2 bg-transparent rounded border border-[#BF8D6B] flex justify-center">
                          <img
                            src={salonDetalle.image || salonDetalle.imagen}
                            alt="Imagen del salón"
                            className="max-h-32 rounded"
                            style={{ maxWidth: "100%", objectFit: "contain" }}
                          />
                        </div>
                      </div>
                    )}
                    <div>
                      <span className="block text-xs text-[#BF8D6B] mb-1">
                        Salón
                      </span>
                      <div className="p-2 bg-transparent rounded border border-[#BF8D6B]">
                        {salonDetalle.salon || salonDetalle.nombre}
                      </div>
                    </div>
                    <div>
                      <span className="block text-xs text-[#BF8D6B] mb-1">
                        CUIT
                      </span>
                      <div className="p-2 bg-transparent rounded border border-[#BF8D6B]">
                        {salonDetalle.cuit}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <span className="block text-xs text-[#BF8D6B] mb-1">
                        Contacto
                      </span>
                      <div className="p-2 bg-transparent rounded border border-[#BF8D6B]">
                        {salonDetalle.contacto || salonDetalle.nombre}
                      </div>
                    </div>
                    <div>
                      <span className="block text-xs text-[#BF8D6B] mb-1">
                        Email
                      </span>
                      <div className="p-2 bg-transparent rounded border border-[#BF8D6B]">
                        {salonDetalle.email}
                      </div>
                    </div>
                    <div>
                      <span className="block text-xs text-[#BF8D6B] mb-1">
                        WhatsApp
                      </span>
                      <div className="p-2 bg-transparent rounded border border-[#BF8D6B]">
                        {salonDetalle.whatsapp}
                      </div>
                    </div>
                    <div>
                      <span className="block text-xs text-[#BF8D6B] mb-1">
                        Capacidad
                      </span>
                      <div className="p-2 bg-transparent rounded border border-[#BF8D6B]">
                        {salonDetalle.capacidad}
                      </div>
                    </div>
                    <div>
                      <span className="block text-xs text-[#BF8D6B] mb-1">
                        Estado
                      </span>
                      <div className="p-2 bg-transparent rounded border border-[#BF8D6B]">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            salonDetalle.isActive ||
                            salonDetalle.estatus ||
                            salonDetalle.activo
                              ? "text-white"
                              : "bg-red-900 text-red-200"
                          }`}
                          style={
                            salonDetalle.isActive ??
                            salonDetalle.estatus ??
                            salonDetalle.activo
                              ? { backgroundColor: "#BF8D6B" }
                              : {}
                          }
                        >
                          {salonDetalle.isActive ??
                          salonDetalle.estatus ??
                          salonDetalle.activo
                            ? "Activo"
                            : "Inactivo"}
                        </span>
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
                  setSalonDetalle(null);
                }}
                className="font-bold py-1.5 px-4 rounded bg-transparent text-white border border-[#BF8D6B] text-sm"
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
