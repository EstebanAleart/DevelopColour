"use client";

import { X } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import apiUrls from "../../components/utils/apiConfig";

const API_URL = apiUrls;

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

  const handleBlur = (e) => {
    const { name, value } = e.target;
    if (name === "whatsapp") {
      const numericValue = value.replace(/\D/g, "");
      if (
        numericValue.length > 0 &&
        (numericValue.length < 9 || numericValue.length > 14)
      ) {
        Swal.fire({
          icon: "warning",
          title: "Advertencia",
          text: "El WhatsApp debe tener entre 9 y 14 dígitos.",
        });
      }
    }
    if (name === "dni") {
      const numericValue = value.replace(/[MF]/gi, "");
      if (
        numericValue.length > 0 &&
        (numericValue.length < 9 || numericValue.length > 14)
      ) {
        Swal.fire({
          icon: "warning",
          title: "Advertencia",
          text: "El DNI debe tener entre 9 y 14 caracteres.",
        });
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "dni") {
      const sanitizedValue = value.replace(/[^0-9MF]/gi, "");
      setFormData((prev) => ({ ...prev, [name]: sanitizedValue }));
    } else if (name === "whatsapp") {
      const sanitizedValue = value.replace(/[^0-9+]/g, "");
      setFormData((prev) => ({ ...prev, [name]: sanitizedValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.nombre ||
      !formData.apellido ||
      !formData.usuario ||
      (!userData && !formData.password)
    ) {
      Swal.fire({
        icon: "warning",
        title: "Campos incompletos",
        text: "Los campos marcados como obligatorios son requeridos.",
      });
      return;
    }
    if (formData.dni) {
      const dniRegex = /^[0-9]+[MF]?$/;
      if (!dniRegex.test(formData.dni)) {
        Swal.fire({
          icon: "warning",
          title: "DNI inválido",
          text: "El DNI debe contener solo números, opcionalmente seguido por la letra M o F.",
        });
        return;
      }
    }
    if (formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        Swal.fire({
          icon: "warning",
          title: "Correo inválido",
          text: "Por favor, ingresa un correo electrónico válido.",
        });
        return;
      }
    }
    if (!userData) {
      const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
      if (!passwordRegex.test(formData.password)) {
        Swal.fire({
          icon: "warning",
          title: "Contraseña inválida",
          text: "La contraseña debe tener al menos 8 caracteres, incluyendo letras mayúsculas, minúsculas, números y caracteres especiales.",
        });
        return;
      }
    }

    setLoading(true);

    try {
      let auth0Id = formData.auth0Id;
      if (!userData) {
        let domain = process.env.NEXT_PUBLIC_AUTH0_DOMAIN;
        const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;
        if (!domain || !clientId) {
          Swal.fire({
            icon: "error",
            title: "Error interno",
            text: "Por favor, contacta al administrador.",
          });
          return;
        }
        domain = domain.replace(/^https?:\/\//, "");
        const auth0Response = await axios.post(
          `https://${domain}/dbconnections/signup`,
          {
            client_id: clientId,
            email: formData.email || `${formData.usuario}@temp.com`,
            password: formData.password,
            connection: "Username-Password-Authentication",
          },
          { headers: { "Content-Type": "application/json" } }
        );
        auth0Id = auth0Response.data._id;
        if (!auth0Id) throw new Error("El ID de Auth0 es nulo o no válido.");
      }

      const userToSave = {
        ...formData,
        auth0Id,
        password: userData ? undefined : formData.password,
      };

      await onSave(userToSave);
      onClose();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          err.response?.data?.message ||
          "Error al guardar el usuario. Por favor, inténtalo de nuevo.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-[#1a1a1a] rounded-lg p-6 w-full max-w-2xl shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">
            {userData ? "Editar Usuario" : "Agregar Usuario"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="w-full">
            <input
              type="text"
              id="usuario"
              name="usuario"
              placeholder="Usuario"
              className="w-76 p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#BF8D6B]"
              value={formData.usuario}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              name="nombre"
              placeholder="Nombre"
              className="w-full p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#BF8D6B]"
              value={formData.nombre}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="apellido"
              placeholder="Apellido"
              className="w-full p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#BF8D6B]"
              value={formData.apellido}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="dni"
              placeholder="DNI"
              className="w-full p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#BF8D6B]"
              value={formData.dni}
              onChange={handleChange}
              onBlur={handleBlur}
            />

            <input
              type="email"
              name="email"
              placeholder="Email"
              className="w-full p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#BF8D6B]"
              value={formData.email}
              onChange={handleChange}
            />

            <input
              type="text"
              name="direccion"
              placeholder="Dirección"
              className="w-full p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#BF8D6B]"
              value={formData.direccion}
              onChange={handleChange}
            />

            <input
              type="text"
              name="whatsapp"
              placeholder="WhatsApp"
              className="w-full p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#BF8D6B]"
              value={formData.whatsapp}
              onChange={handleChange}
              onBlur={handleBlur}
            />

            {!userData && (
              <>
                <input
                  type="password"
                  name="password"
                  placeholder="Contraseña"
                  className="w-full p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#BF8D6B]"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />

                <input
                  type="password"
                  placeholder="Repetir Contraseña"
                  className="w-full p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#BF8D6B]"
                />
              </>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full mt-4 font-bold py-2 px-4 rounded transition-colors ${
              loading
                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                : "bg-[#BF8D6B] text-white hover:bg-[#a67454]"
            }`}
          >
            {loading ? "Cargando..." : userData ? "Guardar Cambios" : "Crear"}
          </button>
        </form>
      </div>
    </div>
  );
}
