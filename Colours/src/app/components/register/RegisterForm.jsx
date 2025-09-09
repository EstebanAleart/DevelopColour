"use client";

import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import InputField from "./InputField";
import Swal from "sweetalert2";
import apiUrls from "../utils/apiConfig";
import { useAuth0 } from "@auth0/auth0-react";
import { AuthContext } from "../../context/AuthContext";

// 👉 importa los componentes que mencionaste
import TermsAndConditions from "./TermsAndCondition";
import BackButton from "./BackButton";

const API_URL = apiUrls;

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    dni: "",
    nombre: "",
    apellido: "",
    direccion: "",
    email: "",
    whatsapp: "",
    usuario: "",
    password: "",
    confirmPassword: "",
    isActive: true,
  });

  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // ----------- CONTEXTO DE AUTH0 -----------
  const { loginWithRedirect, isAuthenticated, user } = useAuth0();
  const { setAuthData } = useContext(AuthContext);

  useEffect(() => {
    if (isAuthenticated && user) {
      const processAuth = async () => {
        try {
          const verifyResponse = await fetch(`${API_URL}/api/users/verificar`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: user.email }),
          });

          const verifyData = await verifyResponse.json();

          if (!verifyResponse.ok || !verifyData.registrado) {
            const registerUser = async () => {
              const response = await fetch(`${API_URL}/api/users/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  auth0Id: user.sub,
                  email: user.email,
                  apellido: user.family_name || "",
                  nombre: user.given_name || user.name || "",
                  rol: "comun",
                }),
              });

              const responseData = await response.json();
              if (!response.ok) {
                throw new Error(
                  responseData.message || "Error al registrar el usuario"
                );
              }

              const newVerifyResponse = await fetch(
                `${API_URL}/api/users/verificar`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ email: user.email }),
                }
              );

              const newVerifyData = await newVerifyResponse.json();
              if (!newVerifyResponse.ok || !newVerifyData.registrado) {
                throw new Error("Error al verificar después del registro");
              }

              return newVerifyData;
            };

            const registeredData = await registerUser();
            if (registeredData && registeredData.registrado) {
              verifyData.usuario = registeredData.usuario;
            }
          }

          if (verifyData.usuario) {
            const userData = verifyData.usuario;

            if (userData.isActive === false) {
              Swal.fire({
                icon: "error",
                title: "Cuenta inactiva",
                text: "Tu cuenta ha sido desactivada. Contacta con soporte.",
                confirmButtonColor: "#BF8D6B",
              });
              setAuthData(null);
              return;
            }

            const standardAuthData = {
              user: userData,
              token: null,
              auth: {
                provider: "auth0",
                auth0User: user,
              },
              timestamp: new Date().toISOString(),
            };

            setAuthData(standardAuthData);

            Swal.fire({
              title: "¡Inicio de sesión exitoso!",
              text: `Bienvenido, ${userData.nombre || user.name}`,
              icon: "success",
              confirmButtonText: "Continuar",
            }).then(() => {
              const redirectPath =
                userData.rol === "admin"
                  ? "/prueba"
                  : userData.rol === "vendor"
                  ? "/vendor"
                  : "/wellcome";

              router.push(redirectPath);
            });
          }
        } catch (error) {
          setAuthData(null);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: error.message || "Ocurrió un error durante la autenticación",
            confirmButtonColor: "#BF8D6B",
          });
          router.push("/users");
        }
      };

      processAuth();
    }
  }, [isAuthenticated, user, router, setAuthData]);

  // ---------------- VALIDACIONES ----------------
  const handleBlur = (e) => {
    const { id, value } = e.target;
    if (id === "whatsapp") {
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
    if (id === "dni") {
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
    const { id, value } = e.target;
    if (id === "dni") {
      const sanitizedValue = value.replace(/[^0-9MF]/gi, "");
      setFormData((prevData) => ({ ...prevData, [id]: sanitizedValue }));
    } else if (id === "whatsapp") {
      const sanitizedValue = value.replace(/[^0-9+]/g, "");
      setFormData((prevData) => ({ ...prevData, [id]: sanitizedValue }));
    } else {
      setFormData((prevData) => ({ ...prevData, [id]: value }));
    }
  };

  // ---------------- REGISTRO MANUAL ----------------
  const handleRegister = async () => {
    const {
      dni,
      nombre,
      apellido,
      direccion,
      email,
      whatsapp,
      usuario,
      password,
      confirmPassword,
      isActive,
    } = formData;

    if (!nombre || !apellido || !usuario || !password || !confirmPassword) {
      Swal.fire({
        icon: "warning",
        title: "Campos incompletos",
        text: "Los campos obligatorios son requeridos.",
      });
      return;
    }

    if (password !== confirmPassword) {
      Swal.fire({
        icon: "warning",
        title: "Contraseñas no coinciden",
        text: "Las contraseñas no coinciden.",
      });
      return;
    }

    setLoading(true);

    try {
      let domain = process.env.NEXT_PUBLIC_AUTH0_DOMAIN;
      const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;
      if (!domain || !clientId) {
        Swal.fire({
          icon: "error",
          title: "Error interno",
          text: "Contacta al administrador.",
        });
        return;
      }
      domain = domain.replace(/^https?:\/\//, "");

      const auth0Response = await axios.post(
        `https://${domain}/dbconnections/signup`,
        {
          client_id: clientId,
          email: email || `${usuario}@temp.com`,
          password,
          connection: "Username-Password-Authentication",
        },
        { headers: { "Content-Type": "application/json" } }
      );

      const auth0Id = auth0Response.data._id;
      if (!auth0Id) throw new Error("El ID de Auth0 es nulo o inválido.");

      const backendData = {
        dni,
        nombre,
        apellido,
        direccion,
        email: email || `${usuario}@temp.com`,
        whatsapp,
        usuario,
        password,
        isActive,
        auth0Id,
      };

      await axios.post(`${API_URL}/api/users/register`, backendData, {
        headers: { "Content-Type": "application/json" },
      });

      Swal.fire({
        icon: "success",
        title: "Registro exitoso",
        text: "¡Bienvenido!",
      });
      router.push("/");
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          err.response?.data?.message ||
          "Error al registrarse. Inténtalo de nuevo.",
      });
    } finally {
      setLoading(false);
    }
  };

  // ---------------- UI ----------------
  return (
    <div className="min-h-screen flex items-center justify-center text-white px-4 py-4">
      <div className="w-full max-w-4xl sm:max-w-3xl bg-[#1C1C1C] rounded-2xl shadow-lg p-6 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-white text-center sm:text-left">
          Registro
        </h2>

        <form className="flex flex-col gap-4">
          {/* Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InputField
              placeholder="Nombre *"
              id="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
            />
            <InputField
              placeholder="Apellido *"
              id="apellido"
              value={formData.apellido}
              onChange={handleChange}
              required
            />
            <InputField
              placeholder="Usuario *"
              id="usuario"
              value={formData.usuario}
              onChange={handleChange}
              required
            />
            <InputField
              placeholder="Correo Electrónico (Opcional)"
              id="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
            />
            <InputField
              placeholder="DNI (Opcional)"
              id="dni"
              value={formData.dni}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <InputField
              placeholder="WhatsApp (Opcional)"
              id="whatsapp"
              value={formData.whatsapp}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <div className="sm:col-span-2">
              <InputField
                placeholder="Dirección (Opcional)"
                id="direccion"
                value={formData.direccion}
                onChange={handleChange}
              />
            </div>
            <InputField
              placeholder="Contraseña *"
              id="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <InputField
              placeholder="Repetir Contraseña *"
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          {/* Botones */}
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <button
              type="button"
              className="flex-1 py-2.5 rounded-lg font-medium bg-white text-black flex items-center justify-center gap-2 shadow-md hover:bg-gray-200 transition"
              onClick={() => loginWithRedirect({ connection: "google-oauth2" })}
            >
              <img src="/google-icon.svg" alt="Google" className="w-5 h-5" />
              Continuar con Google
            </button>

            <button
              type="button"
              onClick={handleRegister}
              disabled={loading}
              className={`flex-1 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                loading
                  ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                  : "bg-[#BF8D6B] hover:bg-[#BF8D6B]/90 text-white shadow-lg hover:shadow-xl"
              }`}
            >
              {loading ? "Cargando..." : "Registrarse"}
            </button>
          </div>

          <div className="mt-4 flex flex-col items-center gap-3">
            <TermsAndConditions />
          </div>

          {/* Imagen debajo de los botones */}
          <div className="mt-4 flex justify-center">
            <img
              src="https://res.cloudinary.com/dmjusy7sn/image/upload/v1753239784/Group_118_i3hj6p.png"
              alt="Decoración"
              className="max-w-[150px] w-full h-auto"
            />
          </div>

          {/* Back button */}
          <div className="mt-4 flex flex-col items-center gap-3">
            <BackButton />
          </div>
        </form>
      </div>
    </div>
  );
}
