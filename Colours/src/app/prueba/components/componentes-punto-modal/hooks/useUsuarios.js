import { useState, useEffect } from "react";
import apiUrls from "@/app/components/utils/apiConfig";

const API_URL = apiUrls;

export const useUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);

  useEffect(() => {
    const fetchUsuarios = async () => {
      setLoadingUsuarios(true);
      try {
        const response = await fetch(`${API_URL}/api/users/usuarios?`);
        const data = await response.json();
        const soloVendors = Array.isArray(data)
          ? data.filter((usuario) => usuario.rol === "vendor")
          : [];
        setUsuarios(soloVendors);
      } catch (error) {
        setUsuarios([]);
      } finally {
        setLoadingUsuarios(false);
      }
    };

    fetchUsuarios();
  }, []);

  return { usuarios, loadingUsuarios };
};
