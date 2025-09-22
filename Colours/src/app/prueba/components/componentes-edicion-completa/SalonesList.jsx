import { useState, useEffect } from "react";

export default function SalonesList({ API_URL, data, setData }) {
  const [loadingSalones, setLoadingSalones] = useState(false);
  const [errorSalones, setErrorSalones] = useState(null);
  const [salones, setSalones] = useState([]);

  const fetchSalones = async () => {
    try {
      setLoadingSalones(true);
      const response = await fetch(`${API_URL}/api/salon?limit=100`);
      if (!response.ok) {
        throw new Error(`Error al obtener salones: ${response.status}`);
      }
      const result = await response.json();
      if (result.success && result.data) {
        const salonesActivos = result.data.filter(
          (salon) => salon.estatus === true
        );
        setSalones(salonesActivos);
      } else {
        throw new Error(result.message || "Error al obtener los salones");
      }
    } catch (err) {
      console.error("Error fetching salones:", err);
      setErrorSalones(err.message);
    } finally {
      setLoadingSalones(false);
    }
  };

  useEffect(() => {
    fetchSalones();
  }, [API_URL]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
        <h3 className="text-lg font-semibold text-white">
          Salones Habilitados ({salones.length})
        </h3>
        <div className="text-sm text-gray-400 mt-1 sm:mt-0">
          Mostrando todos los salones activos
        </div>
      </div>
      <div
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto p-2"
        style={{ scrollbarWidth: "thin" }}
      >
        {loadingSalones ? (
          <div className="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-4 h-32 flex items-center justify-center bg-gray-700 rounded-lg border border-[#BF8D6B]">
            <p className="text-[#BF8D6B]">Cargando salones...</p>
          </div>
        ) : errorSalones ? (
          <div className="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-4 h-32 flex items-center justify-center bg-gray-700 rounded-lg border border-[#BF8D6B]">
            <p className="text-red-400">Error: {errorSalones}</p>
          </div>
        ) : salones.length > 0 ? (
          salones.map((salon) => (
            <div
              key={salon.id}
              className={`bg-gray-700 border border-[#BF8D6B] rounded-lg overflow-hidden hover:bg-gray-600 transition-colors cursor-pointer ${
                data.salonesHabilitados.some((s) => s.id === salon.id)
                  ? "bg-[#BF8D6B]/20 border-[#BF8D6B]"
                  : ""
              }`}
              onClick={() => {
                const isSelected = data.salonesHabilitados.some(
                  (s) => s.id === salon.id
                );
                setData((prev) => ({
                  ...prev,
                  salonesHabilitados: isSelected
                    ? prev.salonesHabilitados.filter((s) => s.id !== salon.id)
                    : [...prev.salonesHabilitados, salon],
                }));
              }}
            >
              <div className="h-24 bg-gray-800 overflow-hidden">
                <img
                  src={salon.image || ""}
                  alt={salon.nombre}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "";
                    e.target.alt = "Imagen no disponible";
                  }}
                />
              </div>
              <div className="p-2">
                <span className="text-sm font-light text-white">
                  {salon.salon}
                </span>
                {data.salonesHabilitados.some((s) => s.id === salon.id) && (
                  <span className="text-green-400 text-xs mt-1 block">
                    Seleccionado
                  </span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-4 h-32 flex items-center justify-center bg-gray-700 rounded-lg border border-[#BF8D6B]">
            <p className="text-gray-400">No hay salones activos disponibles</p>
          </div>
        )}
      </div>
    </div>
  );
}
