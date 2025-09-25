import { useState, useEffect } from "react";
import Swal from "sweetalert2";

export const useUsuarioForm = (usuario, onSave, onClose) => {
  const [formData, setFormData] = useState({
    usuario: "",
    nombre: "",
    apellido: "",
    direccion: "",
    email: "",
    whatsapp: "",
    dni: "",
    eventoId: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (usuario) {
      setLoading(true);
      try {
        setFormData({
          usuario: usuario.usuario || "",
          nombre: usuario.nombre || "",
          apellido: usuario.apellido || "",
          direccion: usuario.direccion || "",
          email: usuario.email || "",
          whatsapp: usuario.whatsapp || "",
          dni: usuario.dni || "",
        });
      } catch (err) {
        setError(err.message || "Error al cargar datos del usuario");
      } finally {
        setLoading(false);
      }
    }
  }, [usuario]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "whatsapp") {
      const validatedValue = value.replace(/[^0-9+]/g, "");
      setFormData((prev) => ({ ...prev, [name]: validatedValue }));
      return;
    }

    if (name === "dni") {
      const validatedValue = value.replace(/[^0-9MFmf]/g, "");
      setFormData((prev) => ({
        ...prev,
        [name]: validatedValue.toUpperCase(),
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSave(usuario.id, formData);
      onClose();

      Swal.fire({
        icon: "success",
        title: "Usuario actualizado",
        text: "Los cambios se guardaron correctamente",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error saving user:", error);

      Swal.fire({
        icon: "error",
        title: "Error al guardar",
        text: error.message,
        footer: "Verifique los datos e intente nuevamente",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    loading,
    error,
    isSubmitting,
    handleChange,
    handleSubmit,
    setFormData,
  };
};
