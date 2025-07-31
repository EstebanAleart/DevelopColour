"use client";

import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext"; // Update this path as needed
import Swal from "sweetalert2";
import apiUrls from "@/app/components/utils/apiConfig";

// URL base de la API centralizada
const API_URL = apiUrls;

export default function ProfilePage() {
  const { authData, setAuthData } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    address: "",
    email: "",
    whatsapp: "",
    dni: "",
    usuario: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // Verificar si tenemos datos de autenticación
        if (!authData || !authData.user) {
          setLoading(false);
          return;
        }

        // Obtener el ID del usuario desde el contexto de autenticación
        const userId = authData.user.id || authData.user._id;

        if (!userId) {
          setLoading(false);
          return;
        }

        // Hacer la petición con Axios usando la constante API_URL
        const response = await axios.get(
          `${API_URL}/api/users/perfil/${userId}`,
          {
            headers: {
              // Incluir token de autorización si está disponible
              ...(authData.token && {
                Authorization: `Bearer ${authData.token}`,
              }),
            },
          }
        );
        const userData = response.data;
        console.log("Datos del perfil:", userData);

        // Si hay datos, actualizar el formulario
        if (userData) {
          setFormData({
            nombre: userData.nombre || "",
            apellido: userData.apellido || "",
            address: userData.direccion || "",
            email: userData.email || "",
            whatsapp: userData.whatsapp || "",
            dni: userData.dni || "",
            usuario: userData.usuario || "",
          });
        }
      } catch (err) {
        console.error("Error al obtener datos del perfil:", err);
        setErrors({
          general:
            "No se pudieron cargar los datos del perfil. Intenta nuevamente.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [authData]);

  // Validar el formulario
  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es obligatorio";
    }

    if (!formData.apellido.trim()) {
      newErrors.apellido = "El apellido es obligatorio";
    }

    // Email ya no es obligatorio
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "El formato del email no es válido";
    }

    // Validar que whatsapp solo contenga números
    if (formData.whatsapp && !/^[0-9+\s-]+$/.test(formData.whatsapp)) {
      newErrors.whatsapp =
        "El WhatsApp debe contener solo números, +, espacios o guiones";
    }

    // DNI ya no es obligatorio
    // Usuario sigue siendo obligatorio
    if (!formData.usuario.trim()) {
      newErrors.usuario = "El nombre de usuario es obligatorio";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Para whatsapp, solo permitir números, +, espacios y guiones
    if (name === "whatsapp" && value && !/^[0-9+\s-]+$/.test(value)) {
      return;
    }

    // Para DNI, solo permitir números y letras M o F al final
    if (name === "dni") {
      const validatedValue = value.replace(/[^0-9MFmf]/g, "");
      setFormData((prev) => ({
        ...prev,
        [name]: validatedValue.toUpperCase(),
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Limpiar error del campo cuando el usuario escribe
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar formulario
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      // Verificar si tenemos datos de autenticación
      if (!authData || !authData.user) {
        setSubmitting(false);
        setErrors({
          general: "No hay sesión activa. Por favor, inicia sesión nuevamente.",
        });
        return;
      }

      const userId = authData.user.id || authData.user._id;

      if (!userId) {
        setSubmitting(false);
        setErrors({
          general: "No se pudo determinar el ID del usuario.",
        });
        return;
      }

      // Preparar los datos para enviar
      const dataToSend = {
        nombre: formData.nombre,
        apellido: formData.apellido,
        direccion: formData.address,
        email: formData.email || null, // Permitir email nulo
        whatsapp: formData.whatsapp || null, // Permitir whatsapp nulo
        dni: formData.dni || null, // Permitir DNI nulo
        usuario: formData.usuario,
      };

      // URL exacta para la solicitud PUT
      const url = `${API_URL}/api/users/perfil/${userId}`;
      console.log("URL exacta para PUT:", url);
      console.log("Datos a enviar:", dataToSend);

      // Usar fetch en lugar de axios, siguiendo el patrón del código existente
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          // Incluir token de autorización si está disponible
          ...(authData.token && {
            Authorization: `Bearer ${authData.token}`,
          }),
        },
        body: JSON.stringify(dataToSend),
      });

      console.log("Respuesta fetch status:", response.status);

      // Verificar si la respuesta es exitosa
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Error HTTP: ${response.status} - ${
            errorData.message || response.statusText
          }`
        );
      }

      // Parsear la respuesta JSON
      const responseData = await response.json();
      console.log("Respuesta fetch exitosa:", responseData);

      // Actualizar el estado global en AuthContext
      if (authData && authData.user) {
        const updatedUser = {
          ...authData.user,
          nombre: formData.nombre,
          apellido: formData.apellido,
          direccion: formData.address,
          email: formData.email,
          whatsapp: formData.whatsapp,
          dni: formData.dni,
          usuario: formData.usuario,
        };

        setAuthData({
          ...authData,
          user: updatedUser,
        });
      }

      // Mostrar mensaje de éxito con SweetAlert
      Swal.fire({
        title: "¡Perfil actualizado!",
        text: "Los cambios se han guardado correctamente",
        icon: "success",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#BF8D6B",
      });
    } catch (err) {
      console.error("Error al actualizar el perfil:", err);

      // Mostrar mensaje de error más específico
      let errorMessage =
        "Error al actualizar el perfil. Verifica que los datos sean correctos.";

      // Intentar extraer información más detallada del error
      if (err.message && err.message.includes("Error HTTP:")) {
        const statusCode = err.message.match(/Error HTTP: (\d+)/)?.[1];

        if (statusCode === "404") {
          errorMessage =
            "No se encontró la ruta para actualizar el perfil. Verifica la URL de la API.";
        } else if (statusCode === "403") {
          errorMessage = "No tienes permiso para actualizar este perfil.";
        } else if (statusCode === "401") {
          errorMessage =
            "Sesión expirada. Por favor, inicia sesión nuevamente.";
        } else if (err.message.includes("-")) {
          // Intentar extraer el mensaje de error del backend
          const serverMessage = err.message.split("-")[1]?.trim();
          if (serverMessage) {
            errorMessage = serverMessage;
          }
        }
      }

      setErrors({
        general: errorMessage,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-full w-full flex-col items-center p-4">
        <div className="w-full max-w-md animate-pulse">
          <div className="h-8 w-32 bg-gray-700 mb-6 rounded"></div>
          <div className="space-y-4">
            <div className="h-12 bg-gray-700 rounded"></div>
            <div className="h-12 bg-gray-700 rounded"></div>
            <div className="h-12 bg-gray-700 rounded"></div>
            <div className="h-12 bg-gray-700 rounded"></div>
            <div className="h-12 bg-gray-700 rounded mt-6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-full w-full flex-col items-center p-4">
      <div className="w-full max-w-md">
        {/* Encabezado con título */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Mi Perfil</h1>
        </div>

        {/* Mensajes de error generales */}
        {errors.general && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-md text-red-200 text-sm">
            {errors.general}
          </div>
        )}

        {/* Formulario de perfil */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Campo de usuario */}
          <div>
            <label
              htmlFor="usuario"
              className="block text-sm text-gray-300 mb-1"
            >
              Nombre de usuario *
            </label>
            <input
              id="usuario"
              type="text"
              name="usuario"
              value={formData.usuario}
              onChange={handleChange}
              placeholder="Nombre de usuario"
              className={`w-full rounded-md border p-3 text-white placeholder-gray-400 focus:outline-none ${
                errors.usuario ? "border-red-500" : "border-[#BF8D6B]"
              }`}
              style={{
                backgroundColor: "transparent",
              }}
              required
              autoComplete="username"
            />
            {errors.usuario && (
              <p className="mt-1 text-red-400 text-xs">{errors.usuario}</p>
            )}
          </div>

          {/* Campo de DNI */}
          <div>
            <label htmlFor="dni" className="block text-sm text-gray-300 mb-1">
              DNI (Opcional)
            </label>
            <input
              id="dni"
              type="text"
              name="dni"
              value={formData.dni}
              onChange={handleChange}
              placeholder="DNI (ej: 12345678M)"
              className={`w-full rounded-md border p-3 text-white placeholder-gray-400 focus:outline-none ${
                errors.dni ? "border-red-500" : "border-[#BF8D6B]"
              }`}
              style={{
                backgroundColor: "transparent",
              }}
            />
            {errors.dni && (
              <p className="mt-1 text-red-400 text-xs">{errors.dni}</p>
            )}
            <p className="text-xs text-gray-400 mt-1">
              Números y letra M o F al final
            </p>
          </div>

          {/* Campo de nombre */}
          <div>
            <label
              htmlFor="nombre"
              className="block text-sm text-gray-300 mb-1"
            >
              Nombre *
            </label>
            <input
              id="nombre"
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Nombre"
              className={`w-full rounded-md border p-3 text-white placeholder-gray-400 focus:outline-none ${
                errors.nombre ? "border-red-500" : "border-[#BF8D6B]"
              }`}
              style={{
                backgroundColor: "transparent",
              }}
              required
              autoComplete="given-name"
            />
            {errors.nombre && (
              <p className="mt-1 text-red-400 text-xs">{errors.nombre}</p>
            )}
          </div>

          {/* Campo de apellido */}
          <div>
            <label
              htmlFor="apellido"
              className="block text-sm text-gray-300 mb-1"
            >
              Apellido *
            </label>
            <input
              id="apellido"
              type="text"
              name="apellido"
              value={formData.apellido}
              onChange={handleChange}
              placeholder="Apellido"
              className={`w-full rounded-md border p-3 text-white placeholder-gray-400 focus:outline-none ${
                errors.apellido ? "border-red-500" : "border-[#BF8D6B]"
              }`}
              style={{
                backgroundColor: "transparent",
              }}
              required
              autoComplete="family-name"
            />
            {errors.apellido && (
              <p className="mt-1 text-red-400 text-xs">{errors.apellido}</p>
            )}
          </div>

          {/* Campo de dirección */}
          <div>
            <label
              htmlFor="address"
              className="block text-sm text-gray-300 mb-1"
            >
              Dirección (Opcional)
            </label>
            <input
              id="address"
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Dirección"
              className="w-full rounded-md border p-3 text-white placeholder-gray-400 focus:outline-none border-[#BF8D6B]"
              style={{
                backgroundColor: "transparent",
              }}
              autoComplete="street-address"
            />
          </div>

          {/* Campo de email */}
          <div>
            <label htmlFor="email" className="block text-sm text-gray-300 mb-1">
              Email (Opcional)
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              className={`w-full rounded-md border p-3 text-white placeholder-gray-400 focus:outline-none ${
                errors.email ? "border-red-500" : "border-[#BF8D6B]"
              }`}
              style={{
                backgroundColor: "transparent",
              }}
              autoComplete="email"
            />
            {errors.email && (
              <p className="mt-1 text-red-400 text-xs">{errors.email}</p>
            )}
          </div>

          {/* Campo de WhatsApp */}
          <div>
            <label
              htmlFor="whatsapp"
              className="block text-sm text-gray-300 mb-1"
            >
              WhatsApp (Opcional)
            </label>
            <input
              id="whatsapp"
              type="tel"
              name="whatsapp"
              value={formData.whatsapp}
              onChange={handleChange}
              placeholder="WhatsApp (solo números)"
              className={`w-full rounded-md border p-3 text-white placeholder-gray-400 focus:outline-none ${
                errors.whatsapp ? "border-red-500" : "border-[#BF8D6B]"
              }`}
              style={{
                backgroundColor: "transparent",
              }}
              autoComplete="tel"
            />
            {errors.whatsapp && (
              <p className="mt-1 text-red-400 text-xs">{errors.whatsapp}</p>
            )}
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full rounded-md py-3 font-medium text-white transition-colors hover:bg-[#A77A5B]"
              style={{ backgroundColor: "#BF8D6B" }}
              disabled={submitting}
            >
              {submitting ? "Actualizando..." : "Actualizar Perfil"}
            </button>
          </div>
        </form>

        {/* <div className="mt-4 text-center">
          <button
            className="text-sm text-gray-300 hover:text-white"
            type="button"
          >
            Cambiar Contraseña
          </button>
        </div> */}
      </div>
    </div>
  );
}
