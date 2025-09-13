"use client";

import { X } from "lucide-react";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";

export default function UsuarioEditarModal({ usuario, onClose, onSave }) {
  const [formData, setFormData] = useState({
    usuario: "",
    nombre: "",
    apellido: "",
    direccion: "",
    email: "",
    whatsapp: "",
    dni: "",
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

  const handleBlur = () => {};
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

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-[#1a1a1a] rounded-lg p-4 w-full max-w-3xl shadow-lg">
        {/* Header */}
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-bold text-white">Editar Usuario</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="p-2 bg-red-900/50 text-red-300 text-xs rounded border border-red-700 mb-3">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Usuario */}
          <input
            type="text"
            name="usuario"
            placeholder="Usuario"
            className="w-full p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs"
            value={formData.usuario}
            onChange={handleChange}
            required
          />

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <input
              type="text"
              name="nombre"
              placeholder="Nombre"
              className="w-full p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs"
              value={formData.nombre}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="apellido"
              placeholder="Apellido"
              className="w-full p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs"
              value={formData.apellido}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="dni"
              placeholder="DNI"
              className="w-full p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs"
              value={formData.dni}
              onChange={handleChange}
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="w-full p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs"
              value={formData.email}
              onChange={handleChange}
            />
            <input
              type="text"
              name="direccion"
              placeholder="Dirección"
              className="w-full p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs"
              value={formData.direccion}
              onChange={handleChange}
            />
            <input
              type="text"
              name="whatsapp"
              placeholder="WhatsApp"
              className="w-full p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs"
              value={formData.whatsapp}
              onChange={handleChange}
            />
            <input
              type="password"
              name="password"
              placeholder="Contraseña"
              className="w-full p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs"
            />
            <input
              type="password"
              name="repeatPassword"
              placeholder="Repetir Contraseña"
              className="w-full p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs"
            />
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="w-full font-bold py-2 px-2 rounded bg-transparent text-white border border-[#BF8D6B] text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="w-full font-bold py-2 px-2 rounded bg-[#BF8D6B] text-white text-sm"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
