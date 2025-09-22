import { useState, useEffect } from "react";

export default function VendedoresList({ API_URL, data, setData }) {
  const [usuarios, setUsuarios] = useState([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);
  const [errorUsuarios, setErrorUsuarios] = useState(null);

  useEffect(() => {
    const fetchUsuarios = async () => {
      setLoadingUsuarios(true);
      try {
        const res = await fetch(`${API_URL}/api/users/usuarios?`);
        const data = await res.json();
        const soloVendedores = Array.isArray(data)
          ? data.filter((u) => u.rol === "vendor")
          : [];
        setUsuarios(soloVendedores);
      } catch (err) {
        setErrorUsuarios("Error al cargar usuarios");
      } finally {
        setLoadingUsuarios(false);
      }
    };
    fetchUsuarios();
  }, [API_URL]);

  return (
    <div>
      <h3 className="text-lg font-semibold text-white mb-4">
        Vendedores asignados
      </h3>
      {loadingUsuarios ? (
        <div className="text-[#BF8D6B] mb-4">Cargando usuarios...</div>
      ) : errorUsuarios ? (
        <div className="text-red-400 mb-4">{errorUsuarios}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {usuarios.length > 0 ? (
            usuarios.map((vendedor) => {
              const isSelected = data.vendedoresAsignados.some(
                (v) => v.id === vendedor.id
              );
              return (
                <div
                  key={vendedor.id}
                  className={`bg-gray-700 border border-[#BF8D6B] rounded-lg overflow-hidden cursor-pointer ${
                    isSelected ? "bg-[#BF8D6B]/20 border-[#BF8D6B]" : ""
                  }`}
                  onClick={() => {
                    setData((prev) => ({
                      ...prev,
                      vendedoresAsignados: isSelected
                        ? prev.vendedoresAsignados.filter(
                            (v) => v.id !== vendedor.id
                          )
                        : [...prev.vendedoresAsignados, vendedor],
                    }));
                  }}
                >
                  <div className="p-4 h-32">
                    <div className="space-y-1 text-white">
                      <p className="font-medium">{vendedor.nombre}</p>
                      <p className="text-xs text-gray-300">
                        Teléfono: {vendedor.telefono}
                      </p>
                      <p className="text-xs text-gray-300">
                        Email: {vendedor.email}
                      </p>
                      <p className="text-xs text-gray-300">
                        WhatsApp: {vendedor.whatsapp}
                      </p>
                      {isSelected && (
                        <span className="text-green-400 text-xs mt-1 block">
                          Seleccionado
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-4 h-32 flex items-center justify-center bg-gray-700 rounded-lg border border-[#BF8D6B]">
              <p className="text-gray-400">No hay vendedores disponibles</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
