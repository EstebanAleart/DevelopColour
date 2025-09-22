import { useState } from "react";

export const useSalonesSelection = () => {
  const [selectedSalones, setSelectedSalones] = useState([]);

  const toggleSalonSelection = (id) => {
    setSelectedSalones((prev) =>
      prev.includes(id)
        ? prev.filter((salonId) => salonId !== id)
        : [...prev, id]
    );
  };

  const toggleAllSelection = (currentPageItems) => {
    if (selectedSalones.length === currentPageItems.length) {
      setSelectedSalones([]);
    } else {
      setSelectedSalones(
        currentPageItems.map((salon) => salon.id || salon._id || salon.Id)
      );
    }
  };

  const clearSelection = () => {
    setSelectedSalones([]);
  };

  return {
    selectedSalones,
    toggleSalonSelection,
    toggleAllSelection,
    clearSelection,
  };
};
