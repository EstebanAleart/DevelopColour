import { useState, useEffect, useCallback } from "react";
import {
  handleFormSubmit,
  handleFieldChange,
  handleFieldBlur,
} from "./handlers";

export const useUsuarioForm = ({ onClose, onSave, userData }) => {
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
    roleId: null,
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
        roleId: userData.roleId || "",
      });
    }
  }, [userData]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    handleFieldChange(name, value, setFormData);
  }, []);

  const handleBlur = useCallback((e) => {
    const { name, value } = e.target;
    handleFieldBlur(name, value);
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      await handleFormSubmit(formData, userData, onSave, onClose, setLoading);
    },
    [formData, userData, onSave, onClose]
  );

  return {
    formData,
    loading,
    handleChange,
    handleBlur,
    handleSubmit,
  };
};
