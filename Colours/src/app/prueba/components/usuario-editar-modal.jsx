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

  // Eliminar validaciones en handleBlur
  const handleBlur = () => {};

  // Eliminar validaciones en handleChange (solo limpiar caracteres no válidos)
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

  // Eliminar validaciones en handleSubmit
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

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
        <div className="bg-gray-800 rounded-lg border-2 border-yellow-600 p-6 w-full max-w-md shadow-lg shadow-yellow-800/20">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white">Editar Usuario</h2>
            <button
              onClick={onClose}
              className="text-yellow-500 hover:text-yellow-300 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex justify-center items-center h-40">
            <p className="text-white">Cargando datos del usuario...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
        <div className="bg-gray-800 rounded-lg border-2 border-yellow-600 p-6 w-full max-w-md shadow-lg shadow-yellow-800/20">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white">Editar Usuario</h2>
            <button
              onClick={onClose}
              className="text-yellow-500 hover:text-yellow-300 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="text-red-400 mb-4">
            <p>Error: {error}</p>
          </div>
          <button
            onClick={onClose}
            className="w-full mt-4 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg border border-gray-600 transition-colors duration-300"
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 ">
      <div className="bg-gray-800 rounded-lg border-2 border-yellow-600 p-6 w-full max-w-2xl shadow-lg shadow-yellow-800/20">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">Editar Usuario</h2>
          <button
            onClick={onClose}
            className="text-yellow-500 hover:text-yellow-300 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username field - full width in all screen sizes */}
          <div className="w-full">
            <label className="block text-sm text-yellow-400 mb-1">
              Usuario
            </label>
            <input
              type="text"
              name="usuario"
              placeholder="Nombre de usuario"
              className="w-full p-3 bg-gray-700 text-white rounded-lg border border-yellow-600 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-500 outline-none transition-colors"
              value={formData.usuario}
              onChange={handleChange}
              required
            />
          </div>

          {/* Two-column grid for larger screens, single column for mobile */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* First column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-yellow-400 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  name="nombre"
                  placeholder="Nombre"
                  className="w-full p-3 bg-gray-700 text-white rounded-lg border border-yellow-600 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-500 outline-none transition-colors"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-yellow-400 mb-1">
                  Dirección{" "}
                  <span className="text-gray-400 text-xs">(Opcional)</span>
                </label>
                <input
                  type="text"
                  name="direccion"
                  placeholder="Dirección completa"
                  className="w-full p-3 bg-gray-700 text-white rounded-lg border border-yellow-600 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-500 outline-none transition-colors"
                  value={formData.direccion}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm text-yellow-400 mb-1">
                  WhatsApp{" "}
                  <span className="text-gray-400 text-xs">(Opcional)</span>
                </label>
                <input
                  type="text"
                  name="whatsapp"
                  placeholder="Ej: +5491123456789"
                  className="w-full p-3 bg-gray-700 text-white rounded-lg border border-yellow-600 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-500 outline-none transition-colors"
                  value={formData.whatsapp}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                <p className="text-xs text-gray-400 mt-1">
                  Solo números, el + debe ir al inicio
                </p>
              </div>
            </div>

            {/* Second column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-yellow-400 mb-1">
                  Apellido
                </label>
                <input
                  type="text"
                  name="apellido"
                  placeholder="Apellido"
                  className="w-full p-3 bg-gray-700 text-white rounded-lg border border-yellow-600 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-500 outline-none transition-colors"
                  value={formData.apellido}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-yellow-400 mb-1">
                  Email{" "}
                  <span className="text-gray-400 text-xs">(Opcional)</span>
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="Correo electrónico"
                  className="w-full p-3 bg-gray-700 text-white rounded-lg border border-yellow-600 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-500 outline-none transition-colors"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm text-yellow-400 mb-1">
                  DNI <span className="text-gray-400 text-xs">(Opcional)</span>
                </label>
                <input
                  type="text"
                  name="dni"
                  placeholder="Ej: 12345678M"
                  className="w-full p-3 bg-gray-700 text-white rounded-lg border border-yellow-600 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-500 outline-none transition-colors"
                  value={formData.dni}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                <p className="text-xs text-gray-400 mt-1">
                  Números y letra M o F al final
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg transition-colors flex items-center gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Guardando...
                </>
              ) : (
                "Guardar Cambios"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
