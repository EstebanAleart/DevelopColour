import { Calendar, Clock, Users, Home, Check, Image } from "lucide-react";

export default function InfoTab({
  formData,
  setFormData,
  salones,
  fetchingSalones,
  capacidadError,
  loading,
  handleChange,
  handleSubmit,
  setActiveTab,
}) {
  const getTodayString = () => {
    const today = new Date();
    const localDate = new Date(
      today.getTime() - today.getTimezoneOffset() * 60000
    );
    return localDate.toISOString().slice(0, 16);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-3"
    >
      <div className="md:col-span-2">
        <label className="block text-xs md:text-sm text-white mb-1">
          Nombre del Evento
        </label>
        <div className="relative">
          <input
            type="text"
            id="nombre"
            name="nombre"
            className="w-full p-2 md:p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs md:text-sm pl-8"
            value={formData.nombre || ""}
            onChange={(e) =>
              setFormData({ ...formData, nombre: e.target.value })
            }
            required
          />
          {/* <Calendar className="absolute left-2 top-1/2 transform -translate-y-1/2 text-[#BF8D6B] h-3 w-3 md:h-4 md:w-4" /> */}
        </div>
      </div>

      <div className="md:col-span-2">
        <label className="block text-xs md:text-sm text-white mb-1">
          Salón
        </label>
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
                  required
                >
                  <option value="">Seleccionar Salón</option>
                  {salones.map((salon) => (
                    <option key={salon.Id} value={salon.Id}>
                      {salon.nombre}{" "}
                      {salon.capacidad ? `(Capacidad: ${salon.capacidad})` : ""}
                    </option>
                  ))}
                </select>
                {/* <Home className="absolute left-2 top-1/2 transform -translate-y-1/2 text-[#BF8D6B] h-3 w-3 md:h-4 md:w-4" /> */}
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
                    className="h-3 w-3 md:h-4 md:w-4 text-[#BF8D6B]"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
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
            step="60"
            required
          />
          {/* <Clock className="absolute left-2 top-1/2 transform -translate-y-1/2 text-[#BF8D6B] h-3 w-3 md:h-4 md:w-4" /> */}
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
          {/* <Clock className="absolute left-2 top-1/2 transform -translate-y-1/2 text-[#BF8D6B] h-3 w-3 md:h-4 md:w-4" /> */}
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
          {/* <Users className="absolute left-2 top-1/2 transform -translate-y-1/2 text-[#BF8D6B] h-3 w-3 md:h-4 md:w-4" /> */}
        </div>
        {capacidadError && (
          <div className="text-xs text-red-400 mt-1">{capacidadError}</div>
        )}
      </div>

      <div className="flex items-center">
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

      <div className="md:col-span-2">
        <label className="block text-xs md:text-sm text-white mb-1 flex justify-between">
          <span>URL de la Imagen (opcional)</span>
          <button
            type="button"
            className="text-xs text-[#BF8D6B] hover:text-[#a67454]"
            onClick={() => setActiveTab("imagenes")}
          >
            Seleccionar de la galería
          </button>
        </label>
        <div className="relative">
          <input
            type="url"
            name="image"
            placeholder="https://example.com/imagen.jpg (opcional)"
            className="w-full p-2 md:p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs md:text-sm pl-8"
            value={formData.image}
            onChange={handleChange}
          />
          {/* <Image className="absolute left-2 top-1/2 transform -translate-y-1/2 text-[#BF8D6B] h-3 w-3 md:h-4 md:w-4" /> */}
        </div>
        {formData.image && (
          <div className="mt-2">
            <img
              src={formData.image}
              alt="Vista previa"
              className="h-12 md:h-16 rounded border border-[#BF8D6B]"
            />
          </div>
        )}
      </div>

      <div className="md:col-span-2">
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

      <div className="md:col-span-2">
        <button
          type="submit"
          className="w-full mt-3 md:mt-4 font-bold py-2 md:py-2 px-2 rounded bg-[#BF8D6B] text-white text-xs md:text-sm flex items-center justify-center gap-2"
          disabled={loading || fetchingSalones || salones.length === 0}
        >
          {loading ? (
            "Creando..."
          ) : (
            <>
              <Check className="h-3 w-3 md:h-4 md:w-4" />
              <span>Crear Evento</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
