"use client";

import { useState, useEffect } from "react";
import { X, Check } from "lucide-react";
import Swal from "sweetalert2";

export default function EntradaModal({
  onClose,
  entrada,
  evento,
  API_URL,
  fetchEntradas,
}) {
  const [formData, setFormData] = useState({
    tipo_entrada: entrada?.tipo_entrada || "",
    descripcion: entrada?.descripcion || "",
    cantidad_total: entrada?.cantidad_total || evento.capacidad || 0,
    // fecha_inicio_venta: entrada?.fecha_inicio_venta || "",
    // fecha_fin_venta: entrada?.fecha_fin_venta || "",
    estatus: entrada?.estatus || "disponible",
    precio: parseFloat(entrada?.precio) || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [remainingCapacity, setRemainingCapacity] = useState(
    evento.capacidad || 0
  );

  useEffect(() => {
    const fetchRemaining = async () => {
      if (!entrada) {
        // Only for create mode
        try {
          const response = await fetch(`${API_URL}/api/entrada/${evento.id}`);
          if (!response.ok) throw new Error("Error fetching entries");
          const { data } = await response.json();
          const totalUsed = data.reduce((sum, e) => sum + e.cantidad_total, 0);
          setRemainingCapacity((evento.capacidad || 0) - totalUsed);
          setFormData((prev) => ({
            ...prev,
            cantidad_total: (evento.capacidad || 0) - totalUsed,
          }));
        } catch (err) {
          setError("Error calculating remaining capacity: " + err.message);
        }
      } else {
        // For edit, remaining is capacidad - sum of others
        try {
          const response = await fetch(`${API_URL}/api/entrada/${evento.id}`);
          if (!response.ok) throw new Error("Error fetching entries");
          const { data } = await response.json();
          const totalOthers = data.reduce(
            (sum, e) => (e.id !== entrada.id ? sum + e.cantidad_total : sum),
            0
          );
          setRemainingCapacity((evento.capacidad || 0) - totalOthers);
        } catch (err) {
          setError("Error calculating remaining capacity: " + err.message);
        }
      }
    };
    fetchRemaining();
  }, [entrada, evento.id, API_URL, evento.capacidad]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.cantidad_total > remainingCapacity) {
      setError(
        `La cantidad total no puede exceder el disponible: ${remainingCapacity}`
      );
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const url = `${API_URL}/api/entrada/`;
      const method = entrada ? "PUT" : "POST";

      const bodyData = entrada
        ? { ...formData, id: entrada.id }
        : { ...formData, eventoId: evento.id };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bodyData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al guardar la entrada");
      }

      Swal.fire({
        icon: "success",
        title: entrada ? "Entrada actualizada" : "Entrada creada",
        text: entrada
          ? "El tipo de entrada ha sido actualizado correctamente."
          : "El tipo de entrada ha sido creado correctamente.",
      });

      onClose();
      fetchEntradas();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-2 md:p-4 ">
      <div className="bg-[#1a1a1a] rounded-lg p-3 md:p-4 w-full max-w-xs md:max-w-2xl max-h-[95vh] overflow-y-auto shadow-lg border border-[#BF8D6B]">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-base md:text-lg font-bold text-white">
            {entrada ? "Editar Tipo de Entrada" : "Crear Tipo de Entrada"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-4 w-4 md:h-5 md:w-5" />
          </button>
        </div>

        {error && (
          <div className="p-2 bg-red-900/50 text-red-300 text-xs rounded border border-red-700 mb-3">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs text-white mb-1">
              Tipo de Entrada *
            </label>
            <input
              type="text"
              name="tipo_entrada"
              value={formData.tipo_entrada}
              onChange={handleChange}
              className="w-full p-2 bg-gray-800 text-white rounded border border-gray-600 text-xs focus:border-[#BF8D6B] focus:outline-none"
              placeholder="Ej: Vip, Estudiante, General"
              required
            />
          </div>

          <div>
            <label className="block text-xs text-white mb-1">Descripción</label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              className="w-full p-2 bg-gray-800 text-white rounded border border-gray-600 text-xs focus:border-[#BF8D6B] focus:outline-none"
              placeholder="Descripción del tipo de entrada"
              rows="2"
            />
          </div>

          <div>
            <label className="block text-xs text-white mb-1">
              Cantidad Total *
            </label>
            <input
              type="number"
              name="cantidad_total"
              value={formData.cantidad_total}
              onChange={handleChange}
              className="w-full p-2 bg-gray-800 text-white rounded border border-gray-600 text-xs focus:border-[#BF8D6B] focus:outline-none"
              min="1"
              max={remainingCapacity}
              required
            />
          </div>

          <div>
            <label className="block text-xs text-white mb-1">Precio *</label>
            <input
              type="number"
              name="precio"
              value={formData.precio}
              onChange={handleChange}
              className="w-full p-2 bg-gray-800 text-white rounded border border-gray-600 text-xs focus:border-[#BF8D6B] focus:outline-none"
              placeholder="0.00"
              step="0.01"
              min="0"
            />
          </div>

          {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-white mb-1">
                Fecha Inicio Venta
              </label>
              <input
                type="datetime-local"
                name="fecha_inicio_venta"
                value={formData.fecha_inicio_venta}
                onChange={handleChange}
                className="w-full p-2 bg-gray-800 text-white rounded border border-gray-600 text-xs focus:border-[#BF8D6B] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-white mb-1">
                Fecha Fin Venta
              </label>
              <input
                type="datetime-local"
                name="fecha_fin_venta"
                value={formData.fecha_fin_venta}
                onChange={handleChange}
                className="w-full p-2 bg-gray-800 text-white rounded border border-gray-600 text-xs focus:border-[#BF8D6B] focus:outline-none"
              />
            </div>
          </div> */}

          <div>
            <label className="block text-xs text-white mb-1">Estatus</label>
            <select
              name="estatus"
              value={formData.estatus}
              onChange={handleChange}
              className="w-full p-2 bg-gray-800 text-white rounded border border-gray-600 text-xs focus:border-[#BF8D6B] focus:outline-none"
            >
              <option value="disponible">Disponible</option>
              <option value="agotado">Agotado</option>
              <option value="suspendido">Suspendido</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 bg-gray-600 text-white rounded text-xs hover:bg-gray-500 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2 bg-[#BF8D6B] text-white rounded text-xs hover:bg-[#a67454] transition-colors flex items-center justify-center gap-1"
              disabled={loading}
            >
              {loading ? "Guardando..." : entrada ? "Actualizar" : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
