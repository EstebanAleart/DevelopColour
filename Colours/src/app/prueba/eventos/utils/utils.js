export const removeAccents = (str) => {
  return str?.normalize("NFD").replace(/[\u0300-\u036f]/g, "") || "";
};

export const formatDateTime = (dateString) => {
  try {
    if (!dateString) return "Fecha no disponible";

    const date = new Date(dateString);

    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const year = date.getUTCFullYear();
    const hours = String(date.getUTCHours()).padStart(2, "0");
    const minutes = String(date.getUTCMinutes()).padStart(2, "0");

    return `${day}/${month}/${year}, ${hours}:${minutes}`;
  } catch (e) {
    console.error("Error formateando fecha:", e, dateString);
    return dateString || "Fecha no disponible";
  }
};

export const formatDateForInput = (dateString) => {
  if (!dateString) return "";

  const date = new Date(dateString);

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};
