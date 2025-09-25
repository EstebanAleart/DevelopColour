"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import GraduadoCrearModal from "@/app/prueba/components/componentes-usuarios/graduado-crear-modal";
import apiUrls from "../utils/apiConfig";
import { useUserActions } from "@/app/prueba/usuarios/hook/useUserActions";

const API_URL = apiUrls;

export default function BuyerInfoForm({ eventIdFromParams }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const [graduados, setGraduados] = useState([]);
  const [filteredGraduados, setFilteredGraduados] = useState([]);
  const [searchGraduado, setSearchGraduado] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedGraduado, setSelectedGraduado] = useState(null);
  const [eventId, setEventId] = useState(eventIdFromParams || null);
  const [userRole, setUserRole] = useState(null);

  // Modal
  const [showGraduadoModal, setShowGraduadoModal] = useState(false);
  const [shouldRefreshGraduados, setShouldRefreshGraduados] = useState(false);

  const { agregarGraduado } = useUserActions(API_URL);

  const fetchGraduados = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/evento/euser/${id}`);
      const data = await res.json();
      if (data.success) {
        setGraduados(data.data);
        setFilteredGraduados(data.data);
      }
    } catch (err) {
      console.error("Error al obtener graduados del evento:", err);
    }
  };

  useEffect(() => {
    setMounted(true);
    const storedRole = localStorage.getItem("b");
    if (storedRole) setUserRole(storedRole);

    if (!eventIdFromParams) {
      console.error("Error: Event ID no recibido como prop.");
      return;
    }
    setEventId(eventIdFromParams);
    fetchGraduados(eventIdFromParams);
  }, []);

  //  Refresca graduados cuando se cierra el modal y la flag está activa
  useEffect(() => {
    if (!showGraduadoModal && shouldRefreshGraduados) {
      fetchGraduados(eventId);
      setShouldRefreshGraduados(false);
    }
  }, [showGraduadoModal]);

  const handleSearchGraduado = (e) => {
    const value = e.target.value;
    setSearchGraduado(value);

    if (!value) setFilteredGraduados(graduados);
    else
      setFilteredGraduados(
        graduados.filter((g) =>
          `${g.nombre} ${g.apellido}`.toLowerCase().includes(value.toLowerCase())
        )
      );

    setShowDropdown(true);
  };

  const handleSelectGraduado = (g) => {
    setSelectedGraduado(g);
    setSearchGraduado(`${g.nombre} ${g.apellido}`);
    setShowDropdown(false);
  };

  const handleSell = () => {
    if (!selectedGraduado) return;

    localStorage.setItem(
      "buyerData",
      JSON.stringify({
        id: selectedGraduado.id,
        name: `${selectedGraduado.nombre} ${selectedGraduado.apellido}`,
        dni: selectedGraduado.dni || "",
        email: selectedGraduado.email || "",
        whatsapp: selectedGraduado.whatsapp || "",
      })
    );

    const path =
      userRole === "admin"
        ? `/prueba/vender/tickets/${eventId}`
        : `/vendor/event/tickets/${eventId}`;
    router.push(path);
  };

  const isFormValid = () => !!selectedGraduado;

  if (!mounted || eventId === null || userRole === null) {
    return (
      <main className="min-h-screen w-full flex items-center justify-center p-2">
        <div className="w-full max-w-md bg-[#1a1a1a] p-3 rounded-lg">
          <p className="text-white text-xs">Cargando...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="w-full flex items-center justify-center p-4">
      <div className="w-full max-w-md p-4 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-white">Seleccionar Graduado</h2>

          <button
            onClick={() => setShowGraduadoModal(true)}
            className="px-2 py-1 text-xs rounded border bg-black hover:bg-[#BF8D6B] hover:text-white transition-colors"
          >
            Agregar
          </button>
        </div>

        <div className="relative mb-4">
          <input
            type="text"
            value={searchGraduado}
            onChange={handleSearchGraduado}
            onFocus={() => setShowDropdown(true)}
            placeholder="Buscar graduado (Nombre y Apellido)"
            className="w-full p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs"
          />
          {showDropdown && filteredGraduados.length > 0 && (
            <ul className="absolute z-10 w-full bg-[#2a2a2a] border border-[#BF8D6B] rounded mt-1 max-h-40 overflow-y-auto text-xs">
              {filteredGraduados.map((g) => (
                <li
                  key={g.id}
                  onClick={() => handleSelectGraduado(g)}
                  className="px-2 py-1 cursor-pointer hover:bg-[#BF8D6B] hover:text-white"
                >
                  {g.nombre} {g.apellido}
                </li>
              ))}
            </ul>
          )}
        </div>

        {selectedGraduado && (
          <div className="border border-[#BF8D6B] rounded p-3 w-full mb-3 text-white text-xs">
            <p className="font-medium mb-2">Resumen del Graduado</p>
            <p>
              <span className="text-[#BF8D6B]">Nombre:</span> {selectedGraduado.nombre}
            </p>
            <p>
              <span className="text-[#BF8D6B]">Apellido:</span> {selectedGraduado.apellido}
            </p>
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={handleSell}
            disabled={!isFormValid()}
            className={`font-bold py-1 px-3 rounded text-xs ${
              isFormValid()
                ? "bg-[#BF8D6B] text-white hover:bg-[#a67454]"
                : "bg-gray-600 text-gray-400 cursor-not-allowed"
            }`}
          >
            Continuar
          </button>
        </div>
      </div>

      {/* Modal */}
      {showGraduadoModal && (
        <GraduadoCrearModal
          eventId={eventId}
          onClose={() => {
            setShowGraduadoModal(false);
            setShouldRefreshGraduados(true); // Flag para refrescar la lista
          }}
          onSave={agregarGraduado} 
        />
      )}
    </main>
  );
}
