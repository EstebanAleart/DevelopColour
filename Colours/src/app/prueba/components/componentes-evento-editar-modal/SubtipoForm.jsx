"use client";

import { X } from "lucide-react";
import Swal from "sweetalert2";

export default function SubtipoForm({
  currentSubtipo,
  setCurrentSubtipo,
  subtipoEntradaId,
  isEditingSubtipo,
  setShowSubtipoForm,
  loadingEntradas,
  errorEntradas,
  setErrorEntradas,
  fetchEntradas,
  API_URL,
}) {
  const handleSubtipoChange = (e) => {
    const { name, value, type, checked } = e.target;

    setCurrentSubtipo({
      ...currentSubtipo,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleGuardarSubtipo = async () => {
    if (
      !currentSubtipo.nombre ||
      !currentSubtipo.precio ||
      !currentSubtipo.cantidad_disponible
    ) {
      setErrorEntradas(
        "Nombre, precio y cantidad son obligatorios para el subtipo"
      );
      return;
    }

    try {
      setErrorEntradas(null);

      const subtipoData = {
        nombre: currentSubtipo.nombre,
        descripcion: currentSubtipo.descripcion,
        precio: parseFloat(currentSubtipo.precio),
        cantidad_disponible: parseInt(currentSubtipo.cantidad_disponible),
        edad_minima: currentSubtipo.edad_minima
          ? parseInt(currentSubtipo.edad_minima)
          : null,
        edad_maxima: currentSubtipo.edad_maxima
          ? parseInt(currentSubtipo.edad_maxima)
          : null,
        requiere_documentacion: currentSubtipo.requiere_documentacion,
        EntradaId: subtipoEntradaId,
      };

      const url = isEditingSubtipo
        ? `${API_URL}/api/entrada/subtipo/${currentSubtipo.id}`
        : `${API_URL}/api/entrada/subtipo/`;

      const method = isEditingSubtipo ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(subtipoData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al guardar el subtipo");
      }

      Swal.fire({
        icon: "success",
        title: isEditingSubtipo ? "Subtipo actualizado" : "Subtipo creado",
        text: isEditingSubtipo
          ? "El subtipo ha sido actualizado correctamente."
          : "El subtipo ha sido creado correctamente.",
      });

      setShowSubtipoForm(false);
      fetchEntradas();
    } catch (err) {
      setErrorEntradas(err.message || "Error al guardar subtipo");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-2 md:p-4">
      <div className="bg-[#1a1a1a] rounded-lg p-3 md:p-4 w-full max-w-xs md:max-w-2xl max-h-[95vh] overflow-y-auto shadow-lg">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-base md:text-lg font-bold text-white">
            {isEditingSubtipo ? "Editar Subtipo" : "Crear Subtipo"}
          </h2>
          <button
            onClick={() => setShowSubtipoForm(false)}
            className="text-gray-400 hover:text-white"
          >
            <X className="h-4 w-4 md:h-5 md:w-5" />
          </button>
        </div>

        {errorEntradas && (
          <div className="p-2 bg-red-900/50 text-red-300 text-xs rounded border border-red-700 mb-3">
            {errorEntradas}
          </div>
        )}

        <div className="space-y-3">
          <div>
            <label className="block text-xs text-white mb-1">Nombre *</label>
            <input
              type="text"
              name="nombre"
              value={currentSubtipo.nombre}
              onChange={handleSubtipoChange}
              className="w-full p-2 bg-transparent text-white rounded border border-[#BF8D6B] text-xs"
              placeholder="Ej: Cena Mayor, Cena Menor"
              required
            />
          </div>

          <div>
            <label className="block text-xs text-white mb-1">Descripción</label>
            <textarea
              name="descripcion"
              value={currentSubtipo.descripcion}
              onChange={handleSubtipoChange}
              className="w-full p-2 bg-transparent text-white rounded border border-[#BF8D6B] text-xs"
              placeholder="Descripción del subtipo"
              rows="2"
            />
          </div>

          <div>
            <label className="block text-xs text-white mb-1">Precio *</label>
            <input
              type="number"
              name="precio"
              value={currentSubtipo.precio}
              onChange={handleSubtipoChange}
              className="w-full p-2 bg-transparent text-white rounded border border-[#BF8D6B] text-xs"
              placeholder="0.00"
              step="0.01"
              min="0"
              required
            />
          </div>

          <div>
            <label className="block text-xs text-white mb-1">
              Cantidad Disponible *
            </label>
            <input
              type="number"
              name="cantidad_disponible"
              value={currentSubtipo.cantidad_disponible}
              onChange={handleSubtipoChange}
              className="w-full p-2 bg-transparent text-white rounded border border-[#BF8D6B] text-xs"
              placeholder="0"
              min="1"
              required
            />
          </div>

          <div>
            <label className="block text-xs text-white mb-1">Edad Máxima</label>
            <input
              type="number"
              name="edad_maxima"
              value={currentSubtipo.edad_maxima}
              onChange={handleSubtipoChange}
              className="w-full p-2 bg-transparent text-white rounded border border-[#BF8D6B] text-xs"
              placeholder="Ej: 65"
              min="0"
            />
          </div>
        </div>

        <div className="flex items-center mt-3">
          <input
            type="checkbox"
            id="requiere_documentacion"
            name="requiere_documentacion"
            checked={currentSubtipo.requiere_documentacion}
            onChange={handleSubtipoChange}
            className="mr-2"
          />
          <label
            htmlFor="requiere_documentacion"
            className="text-xs text-white"
          >
            Requiere documentación
          </label>
        </div>

        <button
          onClick={handleGuardarSubtipo}
          className="w-full py-2 bg-[#BF8D6B] text-white rounded text-xs flex items-center justify-center gap-1 mt-3"
          disabled={loadingEntradas}
        >
          {loadingEntradas
            ? "Guardando..."
            : isEditingSubtipo
            ? "Actualizar Subtipo"
            : "Crear Subtipo"}
        </button>
      </div>
    </div>
  );
}
