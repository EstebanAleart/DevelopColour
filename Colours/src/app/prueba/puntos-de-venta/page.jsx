"use client";

import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import apiUrls from "@/app/components/utils/apiConfig";
import Header from "../components/header";
import PuntoModal from "../components/componentes-punto-modal/punto-modal";
import EditarModal from "../components/componentes-editar-modal/editar-modal";
import EdicionCompleta from "../components/componentes-edicion-completa/edicion-completa";
import UploadImageModal from "../components/cloudinary/upload-image-modal";
import SearchBar from "../components/componentes-punto-de-venta/SearchBar";
import FilterButtons from "../components/componentes-punto-de-venta/FilterButtons";
import ActionButtons from "../components/componentes-punto-de-venta/ActionButtons";
import BulkActions from "../components/componentes-punto-de-venta/BulkActions";
import DesktopTable from "../components/componentes-punto-de-venta/DesktopTable";
import MobileView from "../components/componentes-punto-de-venta/MobileView";
import Pagination from "../components/componentes-punto-de-venta/Pagination";
import DetailModal from "../components/componentes-punto-de-venta/DetailModal";

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
  const [expandedPunto, setExpandedPunto] = useState(null);
  const [selectedPuntos, setSelectedPuntos] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [puntoDetalle, setPuntoDetalle] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

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
        setPuntos(data.data || []);
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
    const currentItems = filteredPuntos.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
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

  return (
    <div className="p-2 md:p-4">
      <Header title="Puntos de Venta" />
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center gap-2 w-full mb-6">
          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          <div className="flex flex-wrap gap-2 md:gap-2">
            <FilterButtons
              filterMode={filterMode}
              setFilterMode={setFilterMode}
              showFilters={showFilters}
              setShowFilters={setShowFilters}
            />
            <ActionButtons
              setShowModal={setShowModal}
              setShowUploadModal={setShowUploadModal}
            />
          </div>
        </div>
        <BulkActions
          selectedPuntos={selectedPuntos}
          bulkToggleStatus={bulkToggleStatus}
          bulkDeletePuntos={bulkDeletePuntos}
        />
      </div>

      <div className="overflow-x-auto">
        <DesktopTable
          currentItems={currentItems}
          selectedPuntos={selectedPuntos}
          togglePuntoSelection={togglePuntoSelection}
          toggleSelectAll={toggleSelectAll}
          handleDeletePunto={handleDeletePunto}
          setSelectedPunto={setSelectedPunto}
          setShowEdicionCompleta={setShowEdicionCompleta}
          handleShowDetail={handleShowDetail}
        />
        <MobileView
          currentItems={currentItems}
          selectedPuntos={selectedPuntos}
          togglePuntoSelection={togglePuntoSelection}
          expandedPunto={expandedPunto}
          setExpandedPunto={setExpandedPunto}
          handleDeletePunto={handleDeletePunto}
          setSelectedPunto={setSelectedPunto}
          setShowEdicionCompleta={setShowEdicionCompleta}
          handleShowDetail={handleShowDetail}
        />
      </div>

      {filteredPuntos.length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-400">
            No se encontraron puntos de venta que coincidan con los criterios de
            búsqueda
          </p>
        </div>
      )}

      <Pagination
        totalPages={totalPages}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />

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

      {showDetailModal && (
        <DetailModal
          puntoDetalle={puntoDetalle}
          loadingDetail={loadingDetail}
          setShowDetailModal={setShowDetailModal}
          setPuntoDetalle={setPuntoDetalle}
        />
      )}
    </div>
  );
}
