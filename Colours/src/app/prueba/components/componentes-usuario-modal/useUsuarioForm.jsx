import { useState, useEffect, useCallback } from "react";
import {
  handleFormSubmit,
  handleFieldChange,
  handleFieldBlur,
} from "./handlers";

export const useUsuarioForm = ({ onClose, onSave, userData, API_URL }) => {
  const [formData, setFormData] = useState({
    id: "",
    auth0Id: null,
    usuario: "",
    nombre: "",
    apellido: "",
    email: "",
    direccion: "",
    whatsapp: "",
    password: "",
    dni: "",
    rol: "comun", // Rol predeterminado
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userData) {
      setFormData({
        id: userData.id || "",
        auth0Id: userData.auth0Id || "",
        usuario: userData.usuario || "",
        nombre: userData.nombre || "",
        apellido: userData.apellido || "",
        email: userData.email || "",
        direccion: userData.direccion || "",
        whatsapp: userData.whatsapp || "",
        password: "",
        dni: userData.dni || "",
        rol: userData.rol || "comun", // Mantener rol existente o usar "comun"
      });
    } else {
      setFormData({
        id: "",
        auth0Id: null,
        usuario: "",
        nombre: "",
        apellido: "",
        email: "",
        direccion: "",
        whatsapp: "",
        password: "",
        dni: "",
        rol: "comun", // Rol predeterminado para nuevos usuarios
      });
    }
  }, [userData]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    handleFieldChange(name, value, setFormData);
  }, []);

  const handleBlur = useCallback(
    (e) => {
      const { name, value } = e.target;
      handleFieldBlur(name, value, setFormData, API_URL);
    },
    [API_URL]
  );

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      await handleFormSubmit(
        formData,
        userData,
        onSave,
        onClose,
        setLoading,
        API_URL
      );
    },
    [formData, userData, onSave, onClose, API_URL]
  );

  return {
    formData,
    loading,
    handleChange,
    handleBlur,
    handleSubmit,
  };
};
