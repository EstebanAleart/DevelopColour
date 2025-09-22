import { useState, useEffect } from "react";
import Swal from "sweetalert2";

export const useUsers = (API_URL, filterMode, isClient) => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      let url = `${API_URL}/api/users/usuarios?`;

      if (filterMode === "active") {
        url += "status=true";
      } else if (filterMode === "inactive") {
        url += "status=false";
      } else {
        url += "includeAll=true";
      }

      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message ||
            `Error del servidor (${response.status}): No se pudieron cargar los usuarios`
        );
      }

      const data = await response.json();
      setUsuarios(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
      Swal.fire({
        icon: "error",
        title: "Error al cargar usuarios",
        text: err.message || "No se pudo establecer conexión con el servidor",
        footer:
          "Intente refrescar la página o contacte al administrador del sistema",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isClient) {
      fetchUsuarios();
    }
  }, [filterMode, isClient]);

  return { usuarios, loading, error, fetchUsuarios };
};
