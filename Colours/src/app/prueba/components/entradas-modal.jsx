"use client";

import { useState } from "react";
import { X, AlertCircle, DollarSign, Tag, Check } from "lucide-react";
import Swal from "sweetalert2";
import apiUrls from "@/app/components/utils/apiConfig";

const API_URL = apiUrls;

export default function EntradasModal({ evento, onClose }) {
  const [formData, setFormData] = useState({
    tipo_entrada: "",
    precio: "",
    estatus: "disponible",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones
    if (!formData.tipo_entrada.trim()) {
      setError("El tipo de entrada es obligatorio");
      return;
    }

    if (
      !formData.precio ||
      isNaN(formData.precio) ||
      Number.parseFloat(formData.precio) <= 0
    ) {
      setError("El precio debe ser un número mayor que cero");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const entradaData = {
        tipo_entrada: formData.tipo_entrada,
        eventoId: evento.id,
        precio: Number.parseFloat(formData.precio),
        cantidad: evento.capacidad, // Usar automáticamente la capacidad del evento
        estatus: formData.estatus,
      };

      const response = await fetch(`${API_URL}/api/entrada/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(entradaData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al crear la entrada");
      }

      const result = await response.json();

      Swal.fire({
        title: "¡Entradas Creadas!",
        text: `Se han creado ${evento.capacidad} entradas de tipo "${formData.tipo_entrada}" correctamente`,
        icon: "success",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#BF8D6B",
        timer: 3000,
        timerProgressBar: true,
      });

      onClose();
    } catch (err) {
      console.error("Error al crear entrada:", err);
      setError(err.message || "No se pudo crear la entrada");

      Swal.fire({
        title: "Error",
        text:
          err.message ||
          "No se pudieron crear las entradas. Intente nuevamente.",
        icon: "error",
        confirmButtonText: "Entendido",
        confirmButtonColor: "#b91c1c",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-[#1a1a1a] rounded-lg p-4 w-full max-w-2xl shadow-lg">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-bold text-white">Agregar Entradas</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-3 p-2 bg-transparent border border-[#BF8D6B] rounded text-xs">
          <h3 className="text-[#BF8D6B] font-medium">Detalles del Evento</h3>
          <p className="text-white mt-1">{evento.nombre}</p>
          <div className="grid grid-cols-2 gap-2 mt-2 text-gray-300">
            <div>
              Capacidad:{" "}
              <span className="text-[#BF8D6B]">
                {evento.capacidad || "Sin límite"}
              </span>
            </div>
            <div>
              Salón:{" "}
              <span className="text-[#BF8D6B]">
                {evento.salon || "Sin asignar"}
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-2 bg-red-900/50 text-red-300 text-xs rounded border border-red-700 mb-3 flex items-start">
            <AlertCircle className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-3"
        >
          <div className="md:col-span-2">
            <label className="block text-sm text-white mb-1">
              Tipo de Entrada
            </label>
            <div className="relative">
              <input
                type="text"
                name="tipo_entrada"
                value={formData.tipo_entrada}
                onChange={handleChange}
                className="w-full p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs pl-8"
                placeholder="Ej: General, VIP, Estudiante"
                required
              />
              <Tag className="absolute left-2 top-1/2 transform -translate-y-1/2 text-[#BF8D6B] h-4 w-4" />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm text-white mb-1">Precio</label>
            <div className="relative">
              <input
                type="number"
                name="precio"
                value={formData.precio}
                onChange={handleChange}
                className="w-full p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs pl-8"
                placeholder="0.00"
                step="0.01"
                min="0"
                required
              />
              <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 text-[#BF8D6B] h-4 w-4" />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm text-white mb-1">Estatus</label>
            <div className="relative">
              <select
                name="estatus"
                value={formData.estatus}
                onChange={handleChange}
                className="w-full p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs pl-8 appearance-none"
              >
                <option value="disponible">Disponible</option>
                <option value="agotado">Agotado</option>
                <option value="reservado">Reservado</option>
              </select>
              <Tag className="absolute left-2 top-1/2 transform -translate-y-1/2 text-[#BF8D6B] h-4 w-4" />
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4 text-[#BF8D6B]"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="p-2 bg-[#BF8D6B]/20 border border-[#BF8D6B] rounded text-[#BF8D6B] text-xs mb-3">
              <p>
                Se crearán <strong>{evento.capacidad}</strong> entradas de tipo{" "}
                <strong>{formData.tipo_entrada || "[Tipo de entrada]"}</strong>{" "}
                para este evento.
              </p>
              <p className="mt-1">
                La cantidad se establece automáticamente según la capacidad del
                evento.
              </p>
            </div>
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full font-bold py-2 px-2 rounded bg-[#BF8D6B] text-white text-sm flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                "Creando..."
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  <span>Crear Entradas</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
