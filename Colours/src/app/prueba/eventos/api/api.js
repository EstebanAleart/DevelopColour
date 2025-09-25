import Swal from "sweetalert2";
import apiUrls from "@/app/components/utils/apiConfig";
import { formatDateTime } from "../utils/utils";

const API_URL = apiUrls;

export const fetchEventos = async (
  filterMode,
  setEventos,
  setLoading,
  setError
) => {
  try {
    setLoading(true);
    let url = `${API_URL}/api/evento`;
    if (filterMode !== "all") {
      url += `?activo=${filterMode === "active"}`; // Fixed: Omit for "all"
    }
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Error al cargar los eventos");
    }

    const resultData = await response.json();

    if (resultData.success && Array.isArray(resultData.data)) {
      const mappedEventos = resultData.data.map((evento) => ({
        id: evento.id,
        nombre: evento.nombre,
        descripcion: evento.descripcion || "Sin descripción",
        fecha: evento.fecha,
        fechaFormateada: formatDateTime(evento.fecha),
        duracion: evento.duracion,
        capacidad: evento.capacidad,
        activo: evento.activo,
        salon: evento.salonNombre || "Sin salón asignado",
        salonId: evento.salonId || "",
        image: evento.image || "",
      }));

      setEventos(mappedEventos);
    } else {
      setEventos([]);
      throw new Error("Formato de respuesta incorrecto");
    }

    setError(null);
  } catch (err) {
    setError(
      "No se pudieron cargar los eventos. Por favor intente nuevamente."
    );
    Swal.fire({
      icon: "error",
      title: "Error al cargar eventos",
      text: err.message || "Hubo un problema al cargar los eventos",
    });
    setEventos([]);
  } finally {
    setLoading(false);
  }
};

export const handleEventoAdded = async (eventoData) => {
  try {
    if (!eventoData.nombre) {
      throw new Error("El campo 'nombre' es obligatorio.");
    }
    const response = await fetch(`${API_URL}/api/evento`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(eventoData),
    });

    if (!response.ok) {
      throw new Error("Error al agregar el evento");
    }

    const result = await response.json();

    Swal.fire({
      title: "¡Éxito!",
      text: result.message || "El evento ha sido agregado correctamente",
      icon: "success",
    });

    return true;
  } catch (err) {
    Swal.fire({
      title: "Error",
      text: err.message || "No se pudo agregar el evento.",
      icon: "error",
    });
    return false;
  }
};

export const handleEventoUpdated = async (id, eventoData) => {
  // console.log(
  //   "handleEventoUpdated called with id:",
  //   id,
  //   "and data:",
  //   eventoData
  // ); 
  try {
    if (!id) {
      throw new Error("El ID del evento no es válido.");
    }

    const response = await fetch(`${API_URL}/api/evento/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(eventoData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error al actualizar el evento");
    }

    const result = await response.json();

    Swal.fire({
      title: "¡Éxito!",
      text: result.message || "El evento ha sido actualizado correctamente",
      icon: "success",
    });

    return true;
  } catch (err) {
    console.error("Error in handleEventoUpdated:", err); // Debugging
    Swal.fire({
      title: "Error",
      text: err.message || "No se pudo actualizar el evento.",
      icon: "error",
    });
    return false;
  }
};

export const handleLogicalDelete = async (id) => {
  try {
    const response = await fetch(`${API_URL}/api/evento/${id}`, {
      method: "PATCH",
    });

    if (!response.ok) {
      throw new Error("Error al desactivar el evento");
    }

    const result = await response.json();

    Swal.fire({
      title: "¡Completado!",
      text: result.message || "El evento ha sido desactivado correctamente",
      icon: "success",
    });

    return true;
  } catch (err) {
    Swal.fire({
      title: "Error",
      text: "No se pudo desactivar el evento.",
      icon: "error",
    });
    return false;
  }
};

export const handlePhysicalDelete = async (id) => {
  try {
    const response = await fetch(`${API_URL}/api/evento/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Error al eliminar el evento");
    }

    const result = await response.json();

    Swal.fire({
      title: "¡Eliminado!",
      text: result.message || "El evento ha sido eliminado permanentemente",
      icon: "success",
    });

    return true;
  } catch (err) {
    Swal.fire({
      title: "Error",
      text: "No se pudo eliminar el evento.",
      icon: "error",
    });
    return false;
  }
};

export const bulkLogicalDelete = async (selectedEventos) => {
  if (selectedEventos.length === 0) {
    Swal.fire({
      icon: "warning",
      title: "Ningún evento seleccionado",
      text: "Por favor selecciona al menos un evento para desactivar",
    });
    return false;
  }

  const result = await Swal.fire({
    title: "¿Desactivar eventos seleccionados?",
    text: `¿Desea desactivar los ${selectedEventos.length} eventos seleccionados?`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#BF8D6B",
    cancelButtonColor: "#d33",
    confirmButtonText: `Sí, desactivar (${selectedEventos.length})`,
    cancelButtonText: "Cancelar",
  });

  if (result.isConfirmed) {
    try {
      Swal.fire({
        title: "Procesando...",
        text: "Desactivando eventos seleccionados",
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const updatePromises = selectedEventos.map((id) =>
        fetch(`${API_URL}/api/evento/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
        })
      );

      await Promise.all(updatePromises);

      Swal.fire({
        title: "¡Completado!",
        text: "Los eventos seleccionados han sido desactivados",
        icon: "success",
        confirmButtonText: "OK",
      });

      return true;
    } catch (err) {
      console.error("Error al desactivar eventos:", err);
      Swal.fire({
        title: "Error",
        text: "No se pudieron desactivar los eventos seleccionados.",
        icon: "error",
        confirmButtonText: "OK",
      });
      return false;
    }
  }
  return false;
};

export const bulkPhysicalDelete = async (selectedEventos) => {
  if (selectedEventos.length === 0) {
    Swal.fire({
      icon: "warning",
      title: "Ningún evento seleccionado",
      text: "Por favor selecciona al menos un evento para eliminar",
    });
    return false;
  }

  const result = await Swal.fire({
    title: "¿Eliminar permanentemente?",
    text: `¿Desea eliminar permanentemente los ${selectedEventos.length} eventos seleccionados? Esta acción no se puede deshacer.`,
    icon: "error",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#BF8D6B",
    confirmButtonText: `Sí, eliminar (${selectedEventos.length})`,
    cancelButtonText: "Cancelar",
  });

  if (result.isConfirmed) {
    const secondConfirm = await Swal.fire({
      title: "¿Está completamente seguro?",
      html: `
        <div class="text-left">
          <p>No podrá recuperar estos ${selectedEventos.length} eventos después de eliminarlos.</p>
          <p class="text-red-500 font-bold mt-2">Esta acción es IRREVERSIBLE.</p>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#BF8D6B",
      confirmButtonText: "Sí, eliminar definitivamente",
      cancelButtonText: "Cancelar",
    });

    if (!secondConfirm.isConfirmed) return false;

    try {
      Swal.fire({
        title: "Procesando...",
        text: "Eliminando eventos seleccionados",
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const deletePromises = selectedEventos.map((id) =>
        fetch(`${API_URL}/api/evento/${id}`, {
          method: "DELETE",
        })
      );

      await Promise.all(deletePromises);

      Swal.fire({
        title: "¡Eliminados!",
        text: "Los eventos seleccionados han sido eliminados permanentemente",
        icon: "success",
        confirmButtonText: "OK",
      });

      return true;
    } catch (err) {
      console.error("Error al eliminar eventos:", err);
      Swal.fire({
        title: "Error",
        text: "No se pudieron eliminar los eventos seleccionados.",
        icon: "error",
        confirmButtonText: "OK",
      });
      return false;
    }
  }
  return false;
};
