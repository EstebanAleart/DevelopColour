// useUsers hook
import { useState, useEffect } from "react";

export const useUsers = (API_URL, filterMode, isClient) => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const status =
        filterMode === "active"
          ? true
          : filterMode === "inactive"
          ? false
          : undefined;
      const response = await fetch(
        `${API_URL}/api/users/grid${
          status !== undefined ? `?status=${status}` : ""
        }`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Error al obtener los usuarios");
      }

      const data = await response.json();
      // console.log("Datos recibidos de /api/users/grid:", data);
      setUsuarios(data);
    } catch (err) {
      setError(err.message);
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
