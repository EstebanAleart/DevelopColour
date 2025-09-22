import { useState, useCallback } from "react";
import apiUrls from "@/app/components/utils/apiConfig";

const API_URL = apiUrls;

export const useSalonesData = () => {
  const [allSalones, setAllSalones] = useState([]);
  const [filteredSalones, setFilteredSalones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const itemsPerPage = 10;

  const removeAccents = useCallback((str) => {
    return str?.normalize("NFD").replace(/[\u0300-\u036f]/g, "") || "";
  }, []);

  const fetchSalones = useCallback(
    async (pageNum = 1, limitNum = 10, search = "") => {
      try {
        setLoading(true);
        let url = `${API_URL}/api/salon?page=${pageNum}&limit=100`;

        if (search) {
          url += `&search=${encodeURIComponent(search)}`;
        }

        url += "&includeAll=true";

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        let salonesData = [];

        if (data.pagination) {
          salonesData = Array.isArray(data.data) ? data.data : [];
          setTotalPages(data.pagination.totalPages);
          setCurrentPage(data.pagination.page);
        } else {
          salonesData = Array.isArray(data)
            ? data
            : data.data
            ? data.data
            : data.salones
            ? data.salones
            : [data];
          setTotalPages(Math.ceil(salonesData.length / limitNum));
        }

        setAllSalones(salonesData);
        return salonesData;
      } catch (err) {
        setError(err.message);
        setAllSalones([]);
        setFilteredSalones([]);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const refreshSalones = useCallback(async () => {
    await fetchSalones(currentPage, itemsPerPage);
  }, [currentPage, fetchSalones, itemsPerPage]);

  return {
    allSalones,
    filteredSalones,
    loading,
    error,
    currentPage,
    totalPages,
    itemsPerPage,
    setCurrentPage,
    setFilteredSalones,
    fetchSalones,
    refreshSalones,
    removeAccents,
  };
};
