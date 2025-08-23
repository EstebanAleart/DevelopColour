"use client";

import { X } from "lucide-react";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";

export default function UsuarioModal({ onClose, onSave, userData }) {
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

  // Elimina las validaciones en handleBlur
  const handleBlur = (e) => {
    // Ya no se valida nada en el blur
  };

  // Elimina las validaciones en handleChange para WhatsApp y DNI
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Elimina las validaciones en handleSubmit para WhatsApp y DNI
  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg border-2 border-yellow-600 p-6 w-full max-w-2xl shadow-lg shadow-yellow-800/20">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">
            {userData ? "Editar Usuario" : "Agregar Usuario"}
          </h2>
          <button
            onClick={onClose}
            className="text-yellow-500 hover:text-yellow-300 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Usuario field - full width in all screen sizes */}
          <div className="w-full">
            <label htmlFor="usuario" className="block text-white mb-1">
              Usuario *
            </label>
            <input
              type="text"
              id="usuario"
              name="usuario"
              placeholder="Ingrese el nombre de usuario"
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
                <label htmlFor="nombre" className="block text-white mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  placeholder="Ingrese el nombre"
                  className="w-full p-3 bg-gray-700 text-white rounded-lg border border-yellow-600 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-500 outline-none transition-colors"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label htmlFor="dni" className="block text-white mb-1">
                  DNI (Opcional)
                </label>
                <input
                  type="text"
                  id="dni"
                  name="dni"
                  placeholder="Solo números y M/F al final"
                  className="w-full p-3 bg-gray-700 text-white rounded-lg border border-yellow-600 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-500 outline-none transition-colors"
                  value={formData.dni}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </div>

              <div>
                <label htmlFor="direccion" className="block text-white mb-1">
                  Dirección (Opcional)
                </label>
                <input
                  type="text"
                  id="direccion"
                  name="direccion"
                  placeholder="Ingrese la dirección"
                  className="w-full p-3 bg-gray-700 text-white rounded-lg border border-yellow-600 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-500 outline-none transition-colors"
                  value={formData.direccion}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="whatsapp" className="block text-white mb-1">
                  WhatsApp (Opcional)
                </label>
                <input
                  type="text"
                  id="whatsapp"
                  name="whatsapp"
                  placeholder="Solo números, + al inicio"
                  className="w-full p-3 bg-gray-700 text-white rounded-lg border border-yellow-600 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-500 outline-none transition-colors"
                  value={formData.whatsapp}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </div>
            </div>

            {/* Second column */}
            <div className="space-y-4">
              <div>
                <label htmlFor="apellido" className="block text-white mb-1">
                  Apellido *
                </label>
                <input
                  type="text"
                  id="apellido"
                  name="apellido"
                  placeholder="Ingrese el apellido"
                  className="w-full p-3 bg-gray-700 text-white rounded-lg border border-yellow-600 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-500 outline-none transition-colors"
                  value={formData.apellido}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-white mb-1">
                  E-mail (Opcional)
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Ingrese el correo electrónico"
                  className="w-full p-3 bg-gray-700 text-white rounded-lg border border-yellow-600 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-500 outline-none transition-colors"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              {!userData && (
                <div>
                  <label htmlFor="password" className="block text-white mb-1">
                    Contraseña *
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    placeholder="Ingrese la contraseña"
                    className="w-full p-3 bg-gray-700 text-white rounded-lg border border-yellow-600 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-500 outline-none transition-colors"
                    value={formData.password}
                    onChange={handleChange}
                    required={!userData}
                  />
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-4 bg-yellow-700 hover:bg-yellow-600 text-white font-bold py-3 px-4 rounded-lg border border-yellow-600 transition-colors duration-300"
          >
            {userData ? "Guardar Cambios" : "Crear"}
          </button>
        </form>
      </div>
    </div>
  );
}
