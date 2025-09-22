"use client";

import { useState } from "react";
import { useUsuarios } from "./hooks/useUsuarios";
import { useFormHandlers } from "./hooks/useFormHandlers";
import { useFormValidation } from "./hooks/useFormValidation";
import ModalLayout from "./ModalLayout";
import FormFields from "./FormFields";
import ErrorDisplay from "./ErrorDisplay";
import ActionButtons from "./ActionButtons";

export default function PuntoModal({ onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    razon: "",
    nombre: "",
    direccion: "",
    telefono: "",
    cuit: "",
    email: "",
    es_online: false,
  });

  const [selectedUser, setSelectedUser] = useState("");
  const [error, setError] = useState(null);

  const { usuarios, loadingUsuarios } = useUsuarios();
  const { handleChange, handleBlur } = useFormHandlers(formData, setFormData);
  const { validateForm, validateCUIT } = useFormValidation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const validationError = validateForm(formData);
    if (validationError) {
      setError(validationError);
      return;
    }

    const formattedCUIT = formData.cuit.replace(
      /(\d{2})(\d{8})(\d{1})/,
      "$1-$2-$3"
    );
    const puntoCreado = await onSubmit({
      ...formData,
      cuit: formattedCUIT,
    });

    if (selectedUser && puntoCreado && puntoCreado.id) {
      await handleVendedorAsignacion(selectedUser, puntoCreado.id);
    }
  };

  return (
    <ModalLayout onClose={onClose} title="Agregar Punto de Venta">
      {error && <ErrorDisplay error={error} />}

      <FormFields
        formData={formData}
        selectedUser={selectedUser}
        usuarios={usuarios}
        loadingUsuarios={loadingUsuarios}
        onUserChange={setSelectedUser}
        onFieldChange={handleChange}
        onFieldBlur={handleBlur}
      />

      <ActionButtons onClose={onClose} onSubmit={handleSubmit} />
    </ModalLayout>
  );
}
