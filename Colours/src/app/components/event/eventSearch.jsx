"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import apiUrls from "@/app/components/utils/apiConfig";
import useUserRoleFromLocalStorage from "../hook/userRoleFromLocalstorage";

const API_URL = apiUrls;

export default function EventSearchPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [allEvents, setAllEvents] = useState([]); // Almacena todos los eventos
  const [filteredEvents, setFilteredEvents] = useState([]); // Eventos filtrados
  const [displayedEvents, setDisplayedEvents] = useState([]); // Eventos mostrados en la página actual
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Estados para los filtros
  const [searchName, setSearchName] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [searchType, setSearchType] = useState("graduacion");
  const [searchLocation, setSearchLocation] = useState("");

  // Estados para la paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const eventsPerPage = 3;

  const { userRole } = useUserRoleFromLocalStorage();

  // Función para formatear la fecha ISO a un formato más legible
  const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Función para obtener todos los eventos una sola vez
  const fetchAllEvents = async () => {
    try {
      setLoading(true);

      // Construir la URL base para obtener todos los eventos de graduación
      const url = `${API_URL}/api/evento?activo=true&tipo=graduacion`;

      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Error de servidor: ${response.status}`);
      }

      const resultData = await response.json();

      if (resultData.success && Array.isArray(resultData.data)) {
        // Guardar todos los eventos
        setAllEvents(resultData.data);
        // Inicialmente, los eventos filtrados son todos los eventos
        setFilteredEvents(resultData.data);
        // Calcular el total de páginas
        setTotalPages(Math.ceil(resultData.data.length / eventsPerPage));
        // Mostrar la primera página
        updateDisplayedEvents(resultData.data, 1);
        setError(null);
      } else {
        setAllEvents([]);
        setFilteredEvents([]);
        setDisplayedEvents([]);
        throw new Error("Formato de respuesta incorrecto");
      }
    } catch (err) {
      setError(
        "No se pudieron cargar los eventos. Por favor intente nuevamente."
      );
      console.error("Error al cargar eventos:", err.message);
      setAllEvents([]);
      setFilteredEvents([]);
      setDisplayedEvents([]);
    } finally {
      setLoading(false);
    }
  };

  // Función para actualizar los eventos mostrados según la página actual
  const updateDisplayedEvents = (events, page) => {
    const startIndex = (page - 1) * eventsPerPage;
    const endIndex = startIndex + eventsPerPage;
    setDisplayedEvents(events.slice(startIndex, endIndex));
  };

  // Función para filtrar eventos localmente
  const filterEvents = () => {
    let filtered = [...allEvents];

    // Filtrar por nombre
    if (searchName && searchName.trim() !== "") {
      const searchTermLower = searchName.trim().toLowerCase();
      filtered = filtered.filter((event) =>
        event.nombre.toLowerCase().includes(searchTermLower)
      );
    }

    // Filtrar por fecha
    if (searchDate && searchDate !== "") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const nextWeekend = new Date(today);
      const dayOfWeek = today.getDay();
      const daysUntilSaturday = dayOfWeek === 6 ? 7 : 6 - dayOfWeek;
      nextWeekend.setDate(today.getDate() + daysUntilSaturday);

      const nextMonth = new Date(today);
      nextMonth.setMonth(today.getMonth() + 1);

      filtered = filtered.filter((event) => {
        const eventDate = new Date(event.fecha);
        eventDate.setHours(0, 0, 0, 0);

        switch (searchDate) {
          case "today":
            return eventDate.getTime() === today.getTime();
          case "tomorrow":
            return eventDate.getTime() === tomorrow.getTime();
          case "weekend":
            return eventDate >= today && eventDate <= nextWeekend;
          case "month":
            return eventDate >= today && eventDate <= nextMonth;
          default:
            return true;
        }
      });
    }

    // Filtrar por ubicación/salón
    if (searchLocation && searchLocation.trim() !== "") {
      const locationLower = searchLocation.trim().toLowerCase();
      filtered = filtered.filter(
        (event) =>
          event.salonNombre &&
          event.salonNombre.toLowerCase().includes(locationLower)
      );
    }

    // Actualizar los eventos filtrados
    setFilteredEvents(filtered);
    // Calcular el nuevo total de páginas
    setTotalPages(Math.ceil(filtered.length / eventsPerPage));
    // Resetear a la primera página cuando se aplica un nuevo filtro
    setCurrentPage(1);
    // Actualizar los eventos mostrados
    updateDisplayedEvents(filtered, 1);
  };

  // Cargar todos los eventos cuando el componente se monta
  useEffect(() => {
    if (mounted) {
      fetchAllEvents();
    }
  }, [mounted]);

  // Montar el componente
  useEffect(() => {
    setMounted(true);
  }, []);

  // Función para buscar al presionar Enter o al hacer clic en el botón de búsqueda
  const handleSearch = (e) => {
    if (e) {
      e.preventDefault(); // Prevenir el comportamiento por defecto si es un evento
    }
    filterEvents();
  };

  // Función para cambiar de página
  const handlePageChange = (page) => {
    setCurrentPage(page);
    updateDisplayedEvents(filteredEvents, page);
  };

  // No renderizar nada hasta que el componente esté montado
  if (!mounted) {
    return (
      <main className="min-h-screen w-full flex items-center justify-center bg-[#12151f]/40 p-4">
        <div className="w-full max-w-md bg-[#1E2330]/80 p-6 rounded-xl shadow-lg">
          <p className="text-white">Cargando...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full flex items-center justify-center  p-4">
      <div className="w-full max-w-md bg-[#1E2330]/80 p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold text-white mb-4">Buscar Evento</h2>

        <form onSubmit={handleSearch} className="space-y-3 mb-8">
          <input
            type="text"
            placeholder="Por nombre"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="w-full px-3 py-2 bg-transparent border border-[#b3964c] rounded-md text-white placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#b3964c]"
          />

          <div className="grid grid-cols-2 gap-3">
            <select
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
              className="w-full px-3 py-2 bg-transparent border border-[#b3964c] rounded-md text-white focus:outline-none focus:ring-1 focus:ring-[#b3964c] appearance-none"
            >
              <option value="" className="bg-[#1e2130]">
                Fecha
              </option>
              <option value="today" className="bg-[#1e2130]">
                Hoy
              </option>
              <option value="tomorrow" className="bg-[#1e2130]">
                Mañana
              </option>
              <option value="weekend" className="bg-[#1e2130]">
                Este fin de semana
              </option>
              <option value="month" className="bg-[#1e2130]">
                Este mes
              </option>
            </select>

            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className="w-full px-3 py-2 bg-transparent border border-[#b3964c] rounded-md text-white focus:outline-none focus:ring-1 focus:ring-[#b3964c] appearance-none"
            >
              <option value="" className="bg-[#1e2130]">
                Tipo
              </option>
              <option value="graduacion" className="bg-[#1e2130]">
                Graduación
              </option>
            </select>
          </div>

          <input
            type="text"
            placeholder="Salón del Evento"
            value={searchLocation}
            onChange={(e) => setSearchLocation(e.target.value)}
            className="w-full px-3 py-2 bg-transparent border border-[#b3964c] rounded-md text-white placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#b3964c]"
          />

          <button
            type="submit"
            className="w-full px-3 py-2 bg-[#b3964c] hover:bg-[#9a7f41] text-black font-medium rounded-md transition-colors"
          >
            Buscar
          </button>
          <p className="text-gray-400 text-xs text-center mt-1">
            Presiona Enter para buscar
          </p>
        </form>

        <div className="h-px bg-gradient-to-r from-transparent via-[#b3964c] to-transparent my-6"></div>

        {loading ? (
          <div className="text-center py-4">
            <p className="text-white">Cargando eventos...</p>
          </div>
        ) : error ? (
          <div className="text-center py-4">
            <p className="text-red-400">{error}</p>
          </div>
        ) : displayedEvents.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-white">No se encontraron eventos</p>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-4">
              {displayedEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex justify-between items-center border border-[#b3964c] rounded-md p-3 w-full"
                >
                  <div className="text-white">
                    <p className="font-medium">{event.nombre}</p>
                    <p className="text-sm text-gray-400">
                      {event.salonNombre} - {formatDate(event.fecha)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Duración: {event.duracion} min | Capacidad:{" "}
                      {event.capacidad} personas
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (userRole) {
                        const path =
                          userRole === "admin"
                            ? `/prueba/vender/${event.id}`
                            : `/vendor/event/${event.id}`;
                        router.push(path);
                      }
                    }}
                    className="px-3 py-1 bg-[#b3964c] hover:bg-[#9a7f41] text-black font-medium rounded-md transition-colors ml-auto"
                  >
                    Vender
                  </button>
                </div>
              ))}
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-4">
                <button
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`px-2 py-1 rounded ${
                    currentPage === 1
                      ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                      : "bg-[#b3964c] text-black hover:bg-[#9a7f41]"
                  }`}
                >
                  &lt;
                </button>

                <span className="text-white">
                  Página {currentPage} de {totalPages}
                </span>

                <button
                  onClick={() =>
                    handlePageChange(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className={`px-2 py-1 rounded ${
                    currentPage === totalPages
                      ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                      : "bg-[#b3964c] text-black hover:bg-[#9a7f41]"
                  }`}
                >
                  &gt;
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
