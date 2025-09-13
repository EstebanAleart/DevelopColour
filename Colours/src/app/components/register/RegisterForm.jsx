"use client";

import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import InputField from "./InputField";
import Swal from "sweetalert2";
import apiUrls from "../utils/apiConfig";
import { useAuth0 } from "@auth0/auth0-react";
import { AuthContext } from "../../context/AuthContext";
import TermsAndConditions from "./TermsAndCondition";
import Link from "next/link";

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

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
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
      // Solo permitir el signo + al principio
      let sanitizedValue = value;
      if (value.length > 1 && value.includes("+") && value.indexOf("+") !== 0) {
        sanitizedValue = value.replace(/\+/g, "");
      }
      sanitizedValue = sanitizedValue.replace(/[^0-9+]/g, "");
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

    if (!acceptedTerms) {
      Swal.fire({
        icon: "warning",
        title: "Términos y condiciones",
        text: "Debes aceptar los términos y condiciones para registrarte.",
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

  // Verificar si el formulario está completo para habilitar el botón
  const isFormValid = () => {
    const { nombre, apellido, usuario, password, confirmPassword } = formData;
    return (
      nombre &&
      apellido &&
      usuario &&
      password &&
      confirmPassword &&
      acceptedTerms
    );
  };

  // ---------------- UI ----------------
  return (
    <div className="min-h-screen flex items-center justify-center text-white px-4 py-4">
      <div className="w-full max-w-4xl sm:max-w-3xl bg-[#1C1C1C] rounded-2xl shadow-lg p-6 sm:p-6">
        {/* Enlace para ingresar */}
        {/* <div className="text-right mb-4">
          <Link
            href="/login"
            className="text-[#BF8D6B] hover:underline text-sm"
          >
            ¿Ya tienes cuenta? Ingresa aquí
          </Link>
        </div> */}

        {/* Logo Xevent centrado */}
        {/* <div className="flex justify-center mb-6">
          <img src="/xevent-logo.png" alt="Xevent Logo" className="h-12" />
        </div> */}

        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-white text-center">
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
              placeholder="DNI (Opcional, acepta M/F)"
              id="dni"
              value={formData.dni}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <InputField
              placeholder="WhatsApp (Opcional, acepta + al inicio)"
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

            {/* Campo de contraseña con toggle de visibilidad */}
            <div className="relative">
              <InputField
                placeholder="Contraseña *"
                id="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-gray-400 hover:text-white"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path
                      fillRule="evenodd"
                      d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                      clipRule="evenodd"
                    />
                    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                  </svg>
                )}
              </button>
            </div>

            {/* Campo de confirmar contraseña con toggle de visibilidad */}
            <div className="relative">
              <InputField
                placeholder="Repetir Contraseña *"
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-gray-400 hover:text-white"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path
                      fillRule="evenodd"
                      d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                      clipRule="evenodd"
                    />
                    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Información sobre requisitos de contraseña */}
          {/* <div className="text-xs text-gray-400 mt-2">
            <p>La contraseña debe tener al menos 8 caracteres, incluyendo:</p>
            <ul className="list-disc pl-5 mt-1">
              <li>Una letra mayúscula</li>
              <li>Una letra minúscula</li>
              <li>Un número</li>
              <li>Un carácter especial</li>
            </ul>
          </div> */}

          {/* Términos y condiciones */}
          <div className="mt-4">
            <TermsAndConditions
              accepted={acceptedTerms}
              setAccepted={setAcceptedTerms}
            />
          </div>

          {/* Botón de registro */}
          <button
            type="button"
            onClick={handleRegister}
            disabled={loading || !isFormValid()}
            className={`w-full py-2.5 rounded-lg font-medium transition-all duration-200 mt-4 ${
              loading || !isFormValid()
                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                : "bg-[#BF8D6B] hover:bg-[#BF8D6B]/90 text-white shadow-lg hover:shadow-xl"
            }`}
          >
            {loading ? "Cargando..." : "Registrarse"}
          </button>

          {/* Imagen debajo del botón de registro */}
          <div className="mt-4 flex justify-center">
            <img
              src="https://res.cloudinary.com/dmjusy7sn/image/upload/v1753239784/Group_118_i3hj6p.png"
              alt="Decoración"
              className="max-w-[150px] w-full h-auto"
            />
          </div>
        </form>
      </div>
    </div>
  );
}
