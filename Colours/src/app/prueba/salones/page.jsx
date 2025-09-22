"use client";

import { useState, useEffect } from "react";
import Header from "../components/header";
import SalonModal from "../components/componentes-salon-modal/salon-modal";
import SalonEditarModal from "../components/componente-salon-editar-modal/salon-editar-modal";
import UploadImageModal from "../components/cloudinary/upload-image-modal";
import Swal from "sweetalert2";
import apiUrls from "@/app/components/utils/apiConfig";

// Hooks personalizados
import { useSalonesData } from "./hook/useSalonesData";
import { useSalonesFilters } from "./hook/useSalonesFilters";
import { useSalonesSelection } from "./hook/useSalonesSelection";

// Componentes
import SalonesFilters from "../components/componentes-salones/SalonesFilters";
import SalonesTable from "../components/componentes-salones/SalonesTable";
import SalonesMobileList from "../components/componentes-salones/SalonesMobileList";
import SalonesPagination from "../components/componentes-salones/SalonesPagination";
import SalonDetailModal from "../components/componentes-salones/SalonDetailModal";

const API_URL = apiUrls;

export default function Salones() {
  // Estados
  const [showModal, setShowModal] = useState(false);
  const [salonAEditar, setSalonAEditar] = useState(null);
  const [expandedSalon, setExpandedSalon] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [salonDetalle, setSalonDetalle] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Hooks personalizados
  const {
    allSalones,
    filteredSalones,
    loading,
    error,
    currentPage,
    totalPages,
    itemsPerPage,
    setCurrentPage,
    setFilteredSalones,
    fetchSalones,
    refreshSalones,
    removeAccents,
  } = useSalonesData();

  const {
    searchTerm,
    filterMode,
    showFilters,
    setSearchTerm,
    setFilterMode,
    setShowFilters,
    applyFilters,
    handleSearch,
    handleFilterChange,
  } = useSalonesFilters(removeAccents);

  const {
    selectedSalones,
    toggleSalonSelection,
    toggleAllSelection,
    clearSelection,
  } = useSalonesSelection();

  // Efectos
  useEffect(() => {
    fetchSalones(currentPage, itemsPerPage, searchTerm);
  }, [fetchSalones, currentPage, itemsPerPage, searchTerm]);

  useEffect(() => {
    if (allSalones.length > 0) {
      const filtered = applyFilters(allSalones, searchTerm, filterMode);
      setFilteredSalones(filtered);
    }
  }, [allSalones, searchTerm, filterMode, applyFilters, setFilteredSalones]);

  // Handlers
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
      cancelButtonColor: "#3085d6",
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

        Swal.fire("Eliminado", data.message, "success");
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
        clearSelection();
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

  // Render states
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

      {/* Filtros y búsqueda */}
      <SalonesFilters
        searchTerm={searchTerm}
        handleSearch={handleSearch}
        filterMode={filterMode}
        handleFilterChange={handleFilterChange}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        onAddSalon={() => setShowModal(true)}
        onUploadImages={() => setShowUploadModal(true)}
        selectedSalones={selectedSalones}
        onBulkActivate={() => bulkToggleStatus(true)}
        onBulkDeactivate={() => bulkToggleStatus(false)}
      />

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

      {/* Tabla de salones */}
      <div className="overflow-x-auto">
        <SalonesTable
          currentItems={currentItems}
          selectedSalones={selectedSalones}
          toggleSalonSelection={toggleSalonSelection}
          toggleAllSelection={() => toggleAllSelection(currentItems)}
          onEditSalon={setSalonAEditar}
          onDeleteSalon={handleDeleteSalon}
          onShowDetail={handleShowDetail}
        />

        <SalonesMobileList
          currentItems={currentItems}
          selectedSalones={selectedSalones}
          toggleSalonSelection={toggleSalonSelection}
          expandedSalon={expandedSalon}
          setExpandedSalon={setExpandedSalon}
          onEditSalon={setSalonAEditar}
          onDeleteSalon={handleDeleteSalon}
        />
      </div>

      {/* Paginación */}
      <SalonesPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

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
      <SalonDetailModal
        showDetailModal={showDetailModal}
        setShowDetailModal={setShowDetailModal}
        loadingDetail={loadingDetail}
        salonDetalle={salonDetalle}
      />
    </div>
  );
}
