"use client";

import { useState, useEffect } from "react";
import { X, ChevronDown } from "lucide-react";
import Swal from "sweetalert2";

// Importar componentes modulares
import InformacionEvento from "./InformacionEvento";
import SelectorImagen from "./SelectorImagen";
import GestionEntradas from "./GestionEntradas";
import GestionContrato from "./GestionContrato";

export default function EventoEditarModal({
  evento,
  onClose,
  onEventoUpdated,
  API_URL,
}) {
  const [activeTab, setActiveTab] = useState("info");
  const [salones, setSalones] = useState([]);
  const [fetchingSalones, setFetchingSalones] = useState(true);
  const [error, setError] = useState(null);

  // Estado para compartir entre componentes
  const [formData, setFormData] = useState({
    nombre: "",
    fecha: "",
    duracion: 60,
    capacidad: 1,
    activo: true,
    salonId: "",
    descripcion: "",
    image: "",
  });

  // Efecto para cargar salones
  useEffect(() => {
    const fetchSalones = async () => {
      try {
        setFetchingSalones(true);
        const response = await fetch(`${API_URL}/api/salon?limit=100`);
        if (!response.ok) {
          throw new Error("Error al cargar los salones");
        }

        const data = await response.json();
        let salonesData = [];

        if (data.success && Array.isArray(data.data)) {
          salonesData = data.data;
        } else if (Array.isArray(data)) {
          salonesData = data;
        } else if (data.salones && Array.isArray(data.salones)) {
          salonesData = data.salones;
        }

        const activeSalones = salonesData.filter(
          (salon) =>
            salon.estatus === true ||
            salon.isActive === true ||
            salon.activo === true
        );

        const validSalones = activeSalones.filter((salon) => {
          return salon.Id || salon.id || salon._id;
        });

        const normalizedSalones = validSalones.map((salon) => ({
          Id: salon.Id || salon.id || salon._id,
          nombre: salon.salon || salon.nombre || "Salón sin nombre",
          capacidad: salon.capacidad,
        }));

        setSalones(normalizedSalones);

        if (normalizedSalones.length === 0) {
          setError(
            "No hay salones disponibles o los salones no tienen IDs válidos"
          );
        }
      } catch (err) {
        console.error("Error fetching salones:", err);
        setError("No se pudieron cargar los salones: " + err.message);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudieron cargar los salones: " + err.message,
        });
      } finally {
        setFetchingSalones(false);
      }
    };

    fetchSalones();
  }, [API_URL]);

  // Efecto para inicializar formData con datos del evento
  useEffect(() => {
    console.log("EventoEditarModal received evento:", evento); // Debugging
    if (evento) {
      const eventDate = new Date(evento.fecha);
      const formattedDate = eventDate.toISOString().slice(0, 16);

      setFormData({
        nombre: evento.nombre || "",
        fecha: formattedDate,
        duracion: evento.duracion || 60,
        capacidad: evento.capacidad || 1,
        activo: evento.activo !== undefined ? evento.activo : true,
        salonId: evento.salonId || "",
        descripcion: evento.descripcion || "",
        image: evento.image || "",
      });
    }
  }, [evento]);

  // Verificar que el evento tenga ID válido
  useEffect(() => {
    if (!evento?.id) {
      console.warn("Invalid evento id:", evento?.id); // Debugging
      Swal.fire({
        title: "Error",
        text: "El evento no tiene un ID válido. No se puede editar.",
        icon: "error",
      });
      onClose();
    }
  }, [evento, onClose]);

  // Renderizar el contenido según la pestaña activa
  const renderActiveTab = () => {
    switch (activeTab) {
      case "info":
        return (
          <InformacionEvento
            formData={formData}
            setFormData={setFormData}
            salones={salones}
            fetchingSalones={fetchingSalones}
            error={error}
            evento={evento}
            onClose={onClose}
            onEventoUpdated={onEventoUpdated}
            API_URL={API_URL}
          />
        );
      case "imagenes":
        return (
          <SelectorImagen
            formData={formData}
            setFormData={setFormData}
            selectedImage={formData.image}
            setActiveTab={setActiveTab}
            API_URL={API_URL}
          />
        );
      case "entradas":
        return (
          <GestionEntradas
            evento={evento}
            API_URL={API_URL}
            setActiveTab={setActiveTab}
          />
        );
      case "contrato":
        return <GestionContrato evento={evento} API_URL={API_URL} />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-2 md:p-4">
      <div className="bg-[#1a1a1a] rounded-lg p-3 md:p-4 w-full max-w-xs md:max-w-3xl max-h-[95vh] overflow-y-auto shadow-lg">
        <div className="flex justify-between items-center mb-3 md:mb-3">
          <h2 className="text-base md:text-lg font-bold text-white">
            Editar Evento
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 md:p-0"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4 md:h-5 md:w-5" />
          </button>
        </div>

        {error && (
          <div className="p-2 md:p-2 bg-red-900/50 text-red-300 text-xs md:text-sm rounded border border-red-700 mb-3 md:mb-3">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 mb-3 md:mb-3">
          <button
            onClick={() => setActiveTab("info")}
            className={`py-2 px-2 text-xs w-full flex items-center justify-center rounded ${
              activeTab === "info"
                ? "text-[#BF8D6B] border-2 border-[#BF8D6B] bg-gray-900"
                : "text-gray-400 hover:text-white border border-gray-700"
            }`}
          >
            Información
          </button>
          <button
            onClick={() => setActiveTab("imagenes")}
            className={`py-2 px-2 text-xs w-full flex items-center justify-center rounded ${
              activeTab === "imagenes"
                ? "text-[#BF8D6B] border-2 border-[#BF8D6B] bg-gray-900"
                : "text-gray-400 hover:text-white border border-gray-700"
            }`}
          >
            Imágenes
          </button>
          <button
            onClick={() => setActiveTab("entradas")}
            className={`py-2 px-2 text-xs w-full flex items-center justify-center rounded ${
              activeTab === "entradas"
                ? "text-[#BF8D6B] border-2 border-[#BF8D6B] bg-gray-900"
                : "text-gray-400 hover:text-white border border-gray-700"
            }`}
          >
            Entradas
          </button>
          <button
            onClick={() => setActiveTab("contrato")}
            className={`py-2 px-2 text-xs w-full flex items-center justify-center rounded ${
              activeTab === "contrato"
                ? "text-[#BF8D6B] border-2 border-[#BF8D6B] bg-gray-900"
                : "text-gray-400 hover:text-white border border-gray-700"
            }`}
          >
            Contrato
          </button>
        </div>

        {renderActiveTab()}
      </div>
    </div>
  );
}
