"use client";

import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import apiUrls from "@/app/components/utils/apiConfig";
import {
  validateWhatsApp,
  validateCUIT,
  validateEmail,
  formatCUIT,
} from "../validation";

const API_URL = apiUrls;

export const useSalonForm = (salon, onClose) => {
  const [formData, setFormData] = useState({
    salon: salon?.salon || "",
    nombre: salon?.nombre || "",
    capacidad: salon?.capacidad || "",
    cuit: salon?.cuit || "",
    email: salon?.email || "",
    whatsapp: salon?.whatsapp || "",
    MercadopagoKeyP: salon?.MercadopagoKeyP || "",
    Mercadopago: salon?.Mercadopago || "",
    cbu: salon?.cbu || "",
    alias: salon?.alias || "",
    estatus: salon?.estatus ? true : false,
    image: salon?.image || "",
  });

  const [initialSalonName, setInitialSalonName] = useState(salon?.salon || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [selectedImage, setSelectedImage] = useState(salon?.image || "");

  useEffect(() => {
    if (salon) {
      setFormData({
        salon: salon.salon || "",
        nombre: salon.nombre || "",
        capacidad: salon.capacidad || "",
        cuit: salon.cuit || "",
        email: salon.email || "",
        whatsapp: salon.whatsapp || "",
        MercadopagoKeyP: salon.MercadopagoKeyP || "",
        Mercadopago: salon.Mercadopago || "",
        cbu: salon.cbu || "",
        alias: salon.alias || "",
        estatus: salon.estatus === true,
        image: salon.image || "",
      });
      setInitialSalonName(salon.salon || "");
      setSelectedImage(salon.image || "");
    }
  }, [salon]);

  const handleBlur = (e) => {
    const { name, value } = e.target;

    if (name === "whatsapp") {
      validateWhatsApp(value);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "whatsapp") {
      const validatedValue = value.replace(/[^0-9+]/g, "");
      if (validatedValue.includes("+")) {
        const parts = validatedValue.split("+");
        if (parts.length > 2 || (parts.length === 2 && parts[0] !== "")) {
          return;
        }
      }
      setFormData((prev) => ({ ...prev, [name]: validatedValue }));
      return;
    }

    if (name === "cuit") {
      const digits = value.replace(/\D/g, "");
      setFormData((prev) => ({ ...prev, [name]: digits }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const checkSalonExists = async (name) => {
    if (name.toLowerCase() === initialSalonName.toLowerCase()) {
      return false;
    }

    try {
      const response = await fetch(
        `${apiUrls}/api/salon?search=${encodeURIComponent(name)}`
      );

      if (!response.ok) {
        // Try to get error details from response
        let errorDetails = "";
        try {
          const errorData = await response.json();
          errorDetails = errorData.message || JSON.stringify(errorData);
        } catch {
          errorDetails = await response.text();
        }

        console.error(
          "Error checking salon - Status:",
          response.status,
          "Details:",
          errorDetails
        );
        throw new Error(
          `Error al verificar disponibilidad del nombre (${response.status})`
        );
      }

      const data = await response.json();

      // Handle different possible response structures
      const salones = data.data || data.salones || data || [];

      return salones.some(
        (s) => s.salon && s.salon.toLowerCase() === name.toLowerCase()
      );
    } catch (error) {
      console.error("Error checking salon:", error);

      // If there's an error, we'll assume the name doesn't exist to allow the form submission
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const requiredFields = ["salon", "nombre", "cuit", "email", "whatsapp"];
      const missingFields = requiredFields.filter((field) => !formData[field]);

      if (missingFields.length > 0) {
        throw new Error("Todos los campos marcados con * son obligatorios");
      }

      if (formData.whatsapp && !/^\+?\d+$/.test(formData.whatsapp)) {
        throw new Error(
          "El WhatsApp solo puede contener números y un + al inicio"
        );
      }

      validateCUIT(formData.cuit);
      validateEmail(formData.email);

      if (formData.salon !== initialSalonName) {
        try {
          const exists = await checkSalonExists(formData.salon);
          if (exists) {
            throw new Error("Ya existe un salón con este nombre");
          }
        } catch (error) {
          console.warn("Salon name check failed, proceeding anyway:", error);
          // Continue with submission even if name check fails
        }
      }

      const submissionData = {
        ...formData,
        cuit: formatCUIT(formData.cuit),
        capacidad: formData.capacidad
          ? Number.parseInt(formData.capacidad)
          : null,
        image: selectedImage,
      };

      // console.log("Sending update to:", `${API_URL}/api/salon/${salon.Id}`);
      // console.log("Update data:", submissionData);

      const response = await fetch(`${API_URL}/api/salon/${salon.Id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Server error:", errorData);
        throw new Error(
          errorData.message ||
            `Error al actualizar (${response.status}: ${response.statusText})`
        );
      }

      const result = await response.json();
      setSuccessMessage(result.message || "Salón actualizado correctamente");

      setTimeout(() => {
        onClose(true);
      }, 1500);
    } catch (error) {
      console.error("Submit error:", error);
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageEdit = (url) => {
    setSelectedImage(url);
    setFormData((prev) => ({ ...prev, image: url }));
  };

  return {
    formData,
    isSubmitting,
    error,
    successMessage,
    selectedImage,
    handleBlur,
    handleChange,
    handleSubmit,
    handleImageEdit,
  };
};
