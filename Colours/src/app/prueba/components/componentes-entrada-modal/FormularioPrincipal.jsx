import { Tag, DollarSign } from "lucide-react";

export default function FormularioPrincipal({
  formData,
  handleChange,
  evento,
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div className="md:col-span-2">
        <label className="block text-xs md:text-sm text-white mb-1">
          Tipo de Entrada *
        </label>
        <div className="relative">
          <input
            type="text"
            name="tipo_entrada"
            value={formData.tipo_entrada}
            onChange={handleChange}
            className="w-full p-2 md:p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs md:text-sm pl-8"
            placeholder="Ej: Vip, Estudiante, General"
            required
          />
          {/* <Tag className="absolute left-2 top-1/2 transform -translate-y-1/2 text-[#BF8D6B] h-3 w-3 md:h-4 md:w-4" /> */}
        </div>
      </div>

      <div className="md:col-span-2">
        <label className="block text-xs md:text-sm text-white mb-1">
          Descripción
        </label>
        <textarea
          name="descripcion"
          value={formData.descripcion}
          onChange={handleChange}
          className="w-full p-2 md:p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs md:text-sm"
          placeholder="Descripción del tipo de entrada"
          rows="2"
        />
      </div>

      <div>
        <label className="block text-xs md:text-sm text-white mb-1">
          Precio *
        </label>
        <div className="relative">
          <input
            type="number"
            name="precio"
            value={formData.precio}
            onChange={handleChange}
            className="w-full p-2 md:p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs md:text-sm pl-8"
            placeholder="0.00"
            step="0.01"
            min="0"
          
          />
          {/* <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 text-[#BF8D6B] h-3 w-3 md:h-4 md:w-4" /> */}
        </div>
      </div>

      <div>
        <label className="block text-xs md:text-sm text-white mb-1">
          Cantidad Total *
        </label>
        <input
          type="number"
          name="cantidad_total"
          value={formData.cantidad_total}
          onChange={handleChange}
          className="w-full p-2 md:p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs md:text-sm"
          min="1"
          max={evento.remainingCapacity || evento.capacidad}
          required
        />
      </div>

      <div>
        <label className="block text-xs md:text-sm text-white mb-1">
          Estatus
        </label>
        <select
          name="estatus"
          value={formData.estatus}
          onChange={handleChange}
          className="w-full p-2 md:p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs md:text-sm"
        >
          <option className="bg-[#171717] text-white" value="disponible">Disponible</option>
          <option className="bg-[#171717] text-white" value="suspendido">Suspendido</option>
          <option className="bg-[#171717] text-white" value="inactivo">Inactivo</option>
        </select>
      </div>

      {/* <div>
        <label className="block text-xs md:text-sm text-white mb-1">
          Fecha Inicio Venta
        </label>
        <input
          type="datetime-local"
          name="fecha_inicio_venta"
          value={formData.fecha_inicio_venta}
          onChange={handleChange}
          className="w-full p-2 md:p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs md:text-sm"
        />
      </div> */}
      {/* 
      <div>
        <label className="block text-xs md:text-sm text-white mb-1">
          Fecha Fin Venta
        </label>
        <input
          type="datetime-local"
          name="fecha_fin_venta"
          value={formData.fecha_fin_venta}
          onChange={handleChange}
          className="w-full p-2 md:p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs md:text-sm"
        />
      </div> */}
    </div>
  );
}
