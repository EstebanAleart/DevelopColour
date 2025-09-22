"use client";

import { Check, ChevronDown } from "lucide-react";
import { useState } from "react";
import Swal from "sweetalert2";

export default function InformacionEvento({
  formData,
  setFormData,
  salones,
  fetchingSalones,
  error,
  evento,
  onClose,
  onEventoUpdated,
  API_URL,
}) {
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type } = e.target;

    if (type === "number") {
      setFormData({
        ...formData,
        [name]: Number.parseInt(value) || 0,
      });
    } else if (type === "checkbox") {
      setFormData({
        ...formData,
        [name]: e.target.checked,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!evento?.id) {
        throw new Error(
          "El ID del evento no está definido. No se puede actualizar el evento."
        );
      }

      const formattedData = {
        ...formData,
        fecha: formData.fecha,
        salonNombre:
          salones.find((salon) => salon.Id === formData.salonId)?.nombre ||
          evento.salon ||
          "",
      };

      const response = await fetch(`${API_URL}/api/evento/${evento.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            `Error ${response.status}: ${response.statusText}`
        );
      }

      const result = await response.json();

      if (result.success) {
        if (onEventoUpdated) onEventoUpdated();
        onClose();
      } else {
        throw new Error(
          result.message || "Error desconocido al actualizar el evento"
        );
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          err.message ||
          "No se pudo actualizar el evento. Por favor intente nuevamente.",
      });
    } finally {
      setLoading(false);
    }
  };

  const getTodayString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const hours = String(today.getHours()).padStart(2, "0");
    const minutes = String(today.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
      <div>
        <label className="block text-xs md:text-sm text-white mb-1">
          Nombre del Evento
        </label>
        <div className="relative">
          <input
            type="text"
            name="nombre"
            placeholder="Nombre del Evento"
            className="w-full p-2 md:p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs md:text-sm pl-8"
            value={formData.nombre}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-xs md:text-sm text-white mb-1">
          Salón
        </label>
        {evento?.salon && (
          <div className="p-2 bg-transparent text-[#BF8D6B] rounded border border-[#BF8D6B] text-xs md:text-sm mb-3">
            Salón asignado: {evento.salon}
          </div>
        )}
        {fetchingSalones ? (
          <div className="p-2 text-center bg-transparent text-[#BF8D6B] rounded border border-[#BF8D6B] text-xs md:text-sm">
            Cargando salones...
          </div>
        ) : (
          <>
            {salones.length > 0 ? (
              <div className="relative">
                <select
                  name="salonId"
                  className="w-full p-2 md:p-2 bg-black text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs md:text-sm pl-8 appearance-none"
                  value={formData.salonId}
                  onChange={handleChange}
                >
                  <option value="">Seleccionar Salón</option>
                  {salones.map((salon) => (
                    <option key={salon.Id} value={salon.Id}>
                      {salon.nombre}{" "}
                      {salon.capacidad ? `(Capacidad: ${salon.capacidad})` : ""}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <ChevronDown className="h-3 w-3 md:h-4 md:w-4 text-[#BF8D6B]" />
                </div>
              </div>
            ) : (
              <div className="p-2 bg-[#BF8D6B]/20 border border-[#BF8D6B] text-[#BF8D6B] rounded text-xs md:text-sm">
                No hay salones disponibles. Por favor, agregue un salón primero.
              </div>
            )}
          </>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-3">
        <div>
          <label className="block text-xs md:text-sm text-white mb-1">
            Fecha y Hora
          </label>
          <div className="relative">
            <input
              type="datetime-local"
              name="fecha"
              className="w-full p-2 md:p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs md:text-sm pl-8"
              value={formData.fecha}
              onChange={handleChange}
              min={getTodayString()}
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-xs md:text-sm text-white mb-1">
            Duración (min)
          </label>
          <div className="relative">
            <input
              type="number"
              name="duracion"
              placeholder="Duración en minutos"
              className="w-full p-2 md:p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs md:text-sm pl-8"
              value={formData.duracion}
              onChange={handleChange}
              min="1"
              required
            />
          </div>
        </div>
      </div>
      <div>
        <label className="block text-xs md:text-sm text-white mb-1">
          Capacidad
        </label>
        <div className="relative">
          <input
            type="number"
            name="capacidad"
            placeholder="Capacidad"
            className="w-full p-2 md:p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs md:text-sm pl-8"
            value={formData.capacidad}
            onChange={handleChange}
            min="1"
            required
          />
        </div>
      </div>
      <div className="flex items-center h-full pt-6">
        <label className="flex items-center cursor-pointer text-xs md:text-sm text-white">
          <div className="relative">
            <input
              type="checkbox"
              name="activo"
              id="activo"
              className="sr-only"
              checked={formData.activo}
              onChange={handleChange}
            />
            <div
              className={`block w-8 h-4 md:w-10 md:h-5 rounded-full transition-colors ${
                formData.activo ? "bg-[#BF8D6B]" : "bg-gray-600"
              }`}
            ></div>
            <div
              className={`absolute left-0.5 top-0.5 bg-white w-3 h-3 md:w-4 md:h-4 rounded-full transition-transform ${
                formData.activo
                  ? "transform translate-x-4 md:translate-x-5"
                  : ""
              }`}
            ></div>
          </div>
          <div className="ml-2">{formData.activo ? "Activo" : "Inactivo"}</div>
        </label>
      </div>

      {formData.image && (
        <div className="mt-2">
          <div className="text-xs text-[#BF8D6B] mb-1">
            URL actual de la imagen:
          </div>
          <div className="p-2 bg-transparent rounded border border-[#BF8D6B] text-white text-xs break-all">
            {formData.image}
          </div>
          <img
            src={formData.image}
            alt="Vista previa"
            className="h-12 md:h-16 rounded border border-[#BF8D6B] mt-2"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/placeholder-image.jpg";
              e.target.alt = "Error al cargar la imagen";
            }}
          />
        </div>
      )}

      <div>
        <label className="block text-xs md:text-sm text-white mb-1">
          Descripción del Evento (opcional)
        </label>
        <textarea
          name="descripcion"
          placeholder="Descripción detallada del evento"
          className="w-full p-2 md:p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs md:text-sm"
          value={formData.descripcion}
          onChange={handleChange}
          rows="2"
        ></textarea>
      </div>

      <button
        type="submit"
        className="w-full mt-3 md:mt-4 font-bold py-2 md:py-2 px-2 rounded bg-[#BF8D6B] text-white text-xs md:text-sm flex items-center justify-center gap-2"
        disabled={loading || fetchingSalones || salones.length === 0}
      >
        {loading ? (
          "Actualizando..."
        ) : (
          <>
            <Check className="h-3 w-3 md:h-4 md:w-4" />
            <span>Actualizar Evento</span>
          </>
        )}
      </button>
    </form>
  );
}
