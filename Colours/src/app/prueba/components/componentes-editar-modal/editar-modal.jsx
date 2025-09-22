"use client";

import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { X } from "lucide-react";
import apiUrls from "@/app/components/utils/apiConfig";

// Componentes modulares
import FormField from "./FormField";
import FormCheckbox from "./FormCheckbox";
import FormActions from "./FormActions";
import ErrorDisplay from "./ErrorDisplay";
import ModalContainer from "./ModalContainer";
import { validateForm, formatCUIT } from "./formUtils";

const API_URL = apiUrls;

export default function EditarModal({ punto, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    razon: "",
    nombre: "",
    direccion: "",
    telefono: "",
    cuit: "",
    email: "",
    es_online: true,
  });

  const [error, setError] = useState(null);

  useEffect(() => {
    if (punto) {
      setFormData({
        razon: punto.razon || "",
        nombre: punto.nombre || "",
        direccion: punto.direccion || "",
        telefono: punto.telefono || "",
        cuit: punto.cuit || "",
        email: punto.email || "",
        es_online: punto.es_online === true,
      });
    }
  }, [punto]);

  const handleBlur = (e) => {
    const { name, value } = e.target;

    if (name === "telefono") {
      const numericValue = value.replace(/\D/g, "");
      if (
        numericValue.length > 0 &&
        (numericValue.length < 9 || numericValue.length > 14)
      ) {
        Swal.fire({
          icon: "warning",
          title: "Advertencia",
          text: "El teléfono debe tener entre 9 y 14 dígitos.",
        });
      }
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "telefono") {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      // Validar formulario
      const validationError = validateForm(formData);
      if (validationError) {
        throw new Error(validationError);
      }

      const formattedCUIT = formatCUIT(formData.cuit);

      const response = await fetch(`${API_URL}/api/puntodeventa/${punto.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          cuit: formattedCUIT,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Error al actualizar el punto de venta"
        );
      }

      onUpdate();
      onClose();
      Swal.fire({
        icon: "success",
        title: "Actualizado",
        text: "Punto de venta actualizado correctamente",
      });
    } catch (error) {
      setError(error.message);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message,
      });
    }
  };

  if (!punto) return null;

  return (
    <ModalContainer onClose={onClose} title="Editar Punto">
      {error && <ErrorDisplay message={error} />}

      <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          {/* Columna 1 */}
          <div className="space-y-3 md:space-y-4">
            <FormField
              label="Razón Social"
              name="razon"
              value={formData.razon}
              onChange={handleChange}
              placeholder="Razón Social *"
              required
            />

            <FormField
              label="Nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Nombre *"
              required
            />

            <FormField
              label="Dirección"
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              placeholder="Dirección *"
              required
            />
          </div>

          {/* Columna 2 */}
          <div className="space-y-3 md:space-y-4">
            <FormField
              label="Teléfono"
              name="telefono"
              type="tel"
              value={formData.telefono}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Teléfono (solo números, + opcional) *"
              required
            />

            <FormField
              label="CUIT"
              name="cuit"
              value={formData.cuit}
              onChange={handleChange}
              placeholder="CUIT (11 dígitos) *"
              maxLength="11"
              showFormattedValue={formData.cuit.length === 11}
              formattedValue={formatCUIT(formData.cuit)}
              required
            />

            <FormField
              label="E-mail"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="E-mail *"
              required
            />
          </div>
        </div>

        <FormCheckbox
          label="Punto Online"
          name="es_online"
          checked={formData.es_online}
          onChange={handleChange}
        />

        <FormActions onCancel={onClose} submitText="Guardar Cambios" />
      </form>
    </ModalContainer>
  );
}
