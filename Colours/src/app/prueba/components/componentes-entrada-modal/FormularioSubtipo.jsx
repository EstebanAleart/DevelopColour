import { DollarSign, Plus } from "lucide-react";

export default function FormularioSubtipo({
  currentSubtipo,
  handleSubtipoChange,
  addSubtipo,
  maxCantidad,
}) {
  return (
    <div className="bg-[#2a2a2a] p-3 rounded mb-3">
      <h4 className="text-[#BF8D6B] text-sm font-medium mb-2">Nuevo Subtipo</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="md:col-span-2">
          <label className="block text-xs text-white mb-1">Nombre *</label>
          <input
            type="text"
            name="nombre"
            value={currentSubtipo.nombre}
            onChange={handleSubtipoChange}
            className="w-full p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs"
            placeholder="Ej: Cena Mayor, Cena Menor"
          />
        </div>

        <div>
          <label className="block text-xs text-white mb-1">Precio *</label>
          <div className="relative">
            <input
              type="number"
              name="precio"
              value={currentSubtipo.precio}
              onChange={handleSubtipoChange}
              className="w-full p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs pl-8"
              placeholder="0.00"
              step="0.01"
              min="0"
            />
            <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 text-[#BF8D6B] h-3 w-3" />
          </div>
        </div>

        <div>
          <label className="block text-xs text-white mb-1">Cantidad *</label>
          <input
            type="number"
            name="cantidad_disponible"
            value={currentSubtipo.cantidad_disponible}
            onChange={handleSubtipoChange}
            className="w-full p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs"
            placeholder="0"
            min="1"
            max={maxCantidad}
          />
        </div>

        <div>
          <label className="block text-xs text-white mb-1">Edad Mínima</label>
          <input
            type="number"
            name="edad_minima"
            value={currentSubtipo.edad_minima}
            onChange={handleSubtipoChange}
            className="w-full p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs"
            placeholder="Ej: 18"
            min="0"
          />
        </div>

        <div>
          <label className="block text-xs text-white mb-1">Edad Máxima</label>
          <input
            type="number"
            name="edad_maxima"
            value={currentSubtipo.edad_maxima}
            onChange={handleSubtipoChange}
            className="w-full p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs"
            placeholder="Ej: 65"
            min="0"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs text-white mb-1">Descripción</label>
          <textarea
            name="descripcion"
            value={currentSubtipo.descripcion}
            onChange={handleSubtipoChange}
            className="w-full p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs"
            placeholder="Descripción del subtipo"
            rows="2"
          />
        </div>

        <div className="md:col-span-2 flex items-center">
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

        <div className="md:col-span-2">
          <button
            type="button"
            onClick={addSubtipo}
            className="w-full py-1 px-2 rounded bg-[#BF8D6B] text-white text-xs flex items-center justify-center gap-1"
          >
            <Plus className="h-3 w-3" />
            Agregar Subtipo
          </button>
        </div>
      </div>
    </div>
  );
}
