export const fetchSalones = async (API_URL) => {
  try {
    const response = await fetch(`${API_URL}/api/salon?limit=100`);
    if (!response.ok) {
      throw new Error("Error al cargar los salones");
    }

    const data = await response.json();
    let salonesData = [];

    if (data.success && Array.isArray(data.data)) {
      salonesData = data.data;
    } else if (Array.isArray(data)) {
      salonesData = data;
    } else if (data.salones && Array.isArray(data.salones)) {
      salonesData = data.salones;
    }

    const activeSalones = salonesData.filter(
      (salon) =>
        salon.estatus === true ||
        salon.isActive === true ||
        salon.activo === true
    );

    const validSalones = activeSalones.filter((salon) => {
      return salon.Id || salon.id || salon._id;
    });

    return validSalones.map((salon) => ({
      Id: salon.Id || salon.id || salon._id,
      nombre: salon.salon || salon.nombre || "Salón sin nombre",
      capacidad: salon.capacidad,
    }));
  } catch (error) {
    throw new Error("No se pudieron cargar los salones: " + error.message);
  }
};

export const fetchImages = async (API_URL) => {
  try {
    const res = await fetch(`${API_URL}/api/upload/images`, {
      cache: "no-store",
    });

    if (!res.ok) throw new Error("No se pudieron obtener las imágenes");

    return await res.json();
  } catch (error) {
    throw new Error("Error al obtener imágenes: " + error.message);
  }
};
