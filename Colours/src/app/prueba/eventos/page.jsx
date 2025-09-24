"use client";

import { useState, useEffect } from "react";
import { Search, Plus, ListFilter, ChevronDown, ChevronUp } from "lucide-react";
import Header from "../components/header";
import EventoModal from "../components/componentes-evento-modal/evento-modal";
import EventoEditarModal from "../components/componentes-evento-editar-modal/evento-editar-modal";
import EntradasModal from "../components/componentes-entrada-modal/entradas-modal";
import UploadImageModal from "../components/cloudinary/upload-image-modal";
import SearchBar from "../components/componentes-eventos/SearchBar";
import FilterButtons from "../components/componentes-eventos/FilterButtons";
import EventTable from "../components/componentes-eventos/EventTable";
import MobileEventCard from "../components/componentes-eventos/MobileEventCard";
import Pagination from "../components/componentes-eventos/Pagination";
import EventDetailModal from "../components/componentes-eventos/EventDetailModal";
import {
  fetchEventos,
  handleEventoAdded,
  handleEventoUpdated,
  handleLogicalDelete,
  handlePhysicalDelete,
  bulkLogicalDelete,
  bulkPhysicalDelete,
} from "./api/api";
import apiUrls from "@/app/components/utils/apiConfig";
import Swal from "sweetalert2";

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
  const [expandedEvento, setExpandedEvento] = useState(null);
  const [showEntradasModal, setShowEntradasModal] = useState(false);
  const [eventoEntradas, setEventoEntradas] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [eventoDetalle, setEventoDetalle] = useState(null);
  const [entradasDetalle, setEntradasDetalle] = useState([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [loadingEntradas, setLoadingEntradas] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const itemsPerPage = 10;

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      fetchEventos(filterMode, setEventos, setLoading, setError);
    }
  }, [filterMode, isClient]);

  const eventosFiltrados = eventos.filter((evento) => {
    const searchText = searchTerm.toLowerCase();
    return (
      evento.nombre?.toLowerCase().includes(searchText) ||
      evento.salon?.toLowerCase().includes(searchText) ||
      evento.fechaFormateada.toLowerCase().includes(searchText) ||
      (evento.duracion?.toString() || "").includes(searchText) ||
      (evento.capacidad?.toString() || "").includes(searchText)
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
    const currentItems = eventosFiltrados.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
    if (selectedEventos.length === currentItems.length) {
      setSelectedEventos([]);
    } else {
      setSelectedEventos(currentItems.map((evento) => evento.id));
    }
  };

  const handleEditEvento = (evento) => {
    console.log("handleEditEvento called with evento:", evento); // Debugging
    if (!evento?.id) {
      console.warn("Invalid evento id:", evento?.id); // Debugging
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
    console.log("handleAddEntradas called with evento:", evento); // Debugging
    if (!evento?.id) {
      console.warn("Invalid evento id:", evento?.id); // Debugging
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

  const handleEventoUpdated = () => {
    console.log("handleEventoUpdated called in Eventos.jsx"); // Debugging
    fetchEventos(filterMode, setEventos, setLoading, setError); // Re-fetch events to update UI
  };

  const handlePhysicalDeleteWithRefresh = async (id) => {
    const success = await handlePhysicalDelete(id);
    if (success) {
      fetchEventos(filterMode, setEventos, setLoading, setError);
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
    <div className="p-2 md:p-4">
      <Header />
      <div className="mb-4 space-y-10">
        <div className="flex flex-col md:flex-row md:items-center gap-2 w-full">
          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          <div className="flex flex-wrap gap-2 md:gap-2">
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
            <FilterButtons
              filterMode={filterMode}
              setFilterMode={setFilterMode}
              setShowFilters={setShowFilters}
            />
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
                onClick={async () => {
                  const success = await bulkPhysicalDelete(selectedEventos);
                  if (success) {
                    fetchEventos(filterMode, setEventos, setLoading, setError);
                    setSelectedEventos([]);
                  }
                }}
                disabled={selectedEventos.length === 0}
              >
                <span className="text-xs md:text-sm">Eliminar</span>
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
            <EventTable
              currentItems={currentItems}
              selectedEventos={selectedEventos}
              toggleAllSelection={toggleAllSelection}
              toggleEventoSelection={toggleEventoSelection}
              handleEditEvento={handleEditEvento}
              handleAddEntradas={handleAddEntradas}
              handlePhysicalDelete={handlePhysicalDeleteWithRefresh}
            />
          </div>
          <div className="md:hidden space-y-2">
            <MobileEventCard
              currentItems={currentItems}
              selectedEventos={selectedEventos}
              toggleEventoSelection={toggleEventoSelection}
              expandedEvento={expandedEvento}
              setExpandedEvento={setExpandedEvento}
              handleEditEvento={handleEditEvento}
              handleAddEntradas={handleAddEntradas}
              handlePhysicalDelete={handlePhysicalDeleteWithRefresh}
            />
          </div>
        </div>

        {eventosFiltrados.length === 0 && !loading && (
          <div className="text-center py-8">
            <p className="text-gray-400 text-sm">No se encontraron eventos</p>
          </div>
        )}

        {totalPages > 1 && (
          <Pagination
            totalPages={totalPages}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
        )}

        {showModal && (
          <EventoModal
            onClose={() => setShowModal(false)}
            onEventoAdded={() => {
              fetchEventos(filterMode, setEventos, setLoading, setError); // Re-fetch after adding
              setShowModal(false);
            }}
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
            API_URL={API_URL}
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
          <EventDetailModal
            eventoDetalle={eventoDetalle}
            entradasDetalle={entradasDetalle}
            loadingDetail={loadingDetail}
            loadingEntradas={loadingEntradas}
            onClose={() => {
              setShowDetailModal(false);
              setEventoDetalle(null);
              setEntradasDetalle([]);
            }}
          />
        )}
      </div>
    </div>
  );
}
