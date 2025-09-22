"use client";

import { X } from "lucide-react";
import Swal from "sweetalert2";
import { useUsuarioForm } from "./hook/useUsuarioForm";
import { FormField } from "./FormField";
import { FormGrid } from "./FormGrid";
import { Modal } from "./Modal";
import { ModalHeader } from "./ModalHeader";

export default function UsuarioEditarModal({ usuario, onClose, onSave }) {
  const { formData, loading, error, isSubmitting, handleChange, handleSubmit } =
    useUsuarioForm(usuario, onSave, onClose);

  return (
    <Modal onClose={onClose}>
      <ModalHeader title="Editar Usuario" onClose={onClose} />

      {error && (
        <div className="p-2 md:p-2 bg-red-900/50 text-red-300 text-xs rounded border border-red-700 mb-3 md:mb-3">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-2 md:space-y-3">
        {/* Usuario */}
        <FormField
          type="text"
          name="usuario"
          placeholder="Usuario *"
          value={formData.usuario}
          onChange={handleChange}
          required
        />

        {/* Grid */}
        <FormGrid>
          <FormField
            type="text"
            name="nombre"
            placeholder="Nombre *"
            value={formData.nombre}
            onChange={handleChange}
            required
          />
          <FormField
            type="text"
            name="apellido"
            placeholder="Apellido *"
            value={formData.apellido}
            onChange={handleChange}
            required
          />
          <FormField
            type="text"
            name="dni"
            placeholder="DNI"
            value={formData.dni}
            onChange={handleChange}
          />
          <FormField
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
          />
          <FormField
            type="text"
            name="direccion"
            placeholder="Dirección"
            value={formData.direccion}
            onChange={handleChange}
          />
          <FormField
            type="text"
            name="whatsapp"
            placeholder="WhatsApp"
            value={formData.whatsapp}
            onChange={handleChange}
          />
          <FormField type="password" name="password" placeholder="Contraseña" />
          <FormField
            type="password"
            name="repeatPassword"
            placeholder="Repetir Contraseña"
          />
        </FormGrid>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-2 md:gap-3 pt-2 md:pt-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full font-bold py-2 md:py-2 px-2 rounded bg-transparent text-white border border-[#BF8D6B] text-xs md:text-sm"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="w-full font-bold py-2 md:py-2 px-2 rounded bg-[#BF8D6B] text-white text-xs md:text-sm"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
