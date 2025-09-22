import { useState, useCallback } from "react";

export const useSalonesFilters = (removeAccents) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMode, setFilterMode] = useState("active");
  const [showFilters, setShowFilters] = useState(false);

  const applyFilters = useCallback(
    (salones, search, mode) => {
      let filtered = [...salones];

      if (search) {
        const searchLower = removeAccents(search.toLowerCase());
        filtered = filtered.filter((salon) => {
          const nombre = removeAccents(
            (salon.salon || salon.nombre || "").toLowerCase()
          );
          const contacto = removeAccents((salon.contacto || "").toLowerCase());
          const email = removeAccents((salon.email || "").toLowerCase());
          const whatsapp = (salon.whatsapp || "").toLowerCase();
          const cuit = (salon.cuit || "").toLowerCase();

          return (
            nombre.includes(searchLower) ||
            contacto.includes(searchLower) ||
            email.includes(searchLower) ||
            whatsapp.includes(searchLower) ||
            cuit.includes(searchLower)
          );
        });
      }

      if (mode === "active") {
        filtered = filtered.filter(
          (salon) =>
            salon.isActive === true ||
            salon.estatus === true ||
            salon.activo === true
        );
      } else if (mode === "inactive") {
        filtered = filtered.filter(
          (salon) =>
            salon.isActive === false ||
            salon.estatus === false ||
            salon.activo === false
        );
      }

      return filtered;
    },
    [removeAccents]
  );

  const handleSearch = (e) => {
    const searchValue = e.target.value;
    setSearchTerm(searchValue);
  };

  const handleFilterChange = (mode) => {
    setFilterMode(mode);
  };

  return {
    searchTerm,
    filterMode,
    showFilters,
    setSearchTerm,
    setFilterMode,
    setShowFilters,
    applyFilters,
    handleSearch,
    handleFilterChange,
  };
};
