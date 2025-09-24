"use client";

import Image from "next/image";
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import apiUrls from "../utils/apiConfig";
import { AuthContext } from "../../context/AuthContext";
import Link from "next/link";

const API_URL = apiUrls;

export default function OAuthButton() {
  const { loginWithRedirect, isAuthenticated, user } = useAuth0();
  const router = useRouter();
  const { setAuthData } = useContext(AuthContext);

  useEffect(() => {
    if (isAuthenticated && user) {
      // Primero verificamos la cuenta antes de mostrar cualquier mensaje de éxito
      const processAuth = async () => {
        try {
          const verifyResponse = await fetch(`${API_URL}/api/users/verificar`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: user.email,
            }),
          });

          const verifyData = await verifyResponse.json();

          if (!verifyResponse.ok || !verifyData.registrado) {
            const registerUser = async () => {
              try {
                const response = await fetch(`${API_URL}/api/users/register`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    auth0Id: user.sub,
                    email: user.email,
                    apellido: user.family_name || "",
                    nombre: user.given_name || user.name || "",
                    rol: "comun",
                    usuario: user.nickname || null, // Explicitly set usuario to null if not provided
                  }),
                });

                const responseData = await response.json();

                if (!response.ok) {
                  throw new Error(
                    responseData.message || "Error al registrar el usuario"
                  );
                }

                // Verificar nuevamente después del registro
                const newVerifyResponse = await fetch(
                  `${API_URL}/api/users/verificar`,
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      email: user.email,
                    }),
                  }
                );

                if (!newVerifyResponse.ok) {
                  throw new Error("Error al verificar después del registro");
                }

                const newVerifyData = await newVerifyResponse.json();

                if (newVerifyResponse.ok && newVerifyData.registrado) {
                  verifyData.usuario = newVerifyData.usuario;
                  return newVerifyData;
                }
              } catch (error) {
                Swal.fire({
                  icon: "error",
                  title: "Error de registro",
                  text: error.message || "No se pudo registrar el usuario",
                  confirmButtonColor: "#BF8D6B",
                });
                throw error;
              }
            };

            const registeredData = await registerUser();
            if (registeredData && registeredData.registrado) {
              verifyData.usuario = registeredData.usuario;
            }
          }

          // ESTRUCTURA ESTANDARIZADA PARA EL CONTEXTO
          if (verifyData.usuario) {
            const userData = verifyData.usuario;

            // Validar si la cuenta está activa
            if (userData.isActive === false) {
              Swal.fire({
                icon: "error",
                title: "Cuenta inactiva",
                text: "Tu cuenta ha sido desactivada. Por favor contacta con soporte para más información.",
                confirmButtonColor: "#BF8D6B",
              });
              setAuthData(null); // Limpiar contexto en caso de cuenta inactiva
              return;
            }

            // Formato estandarizado para el contexto
            const standardAuthData = {
              user: userData,
              token: null, // No tenemos token en Auth0 (gestionado por Auth0)
              auth: {
                provider: "auth0",
                auth0User: user,
              },
              timestamp: new Date().toISOString(),
            };

            // Guardar en contexto
            setAuthData(standardAuthData);

            // Mostrar mensaje de éxito SOLO si la cuenta está activa
            Swal.fire({
              title: "¡Inicio de sesión exitoso!",
              text: `Bienvenido, ${userData.nombre || user.name}`,
              icon: "success",
              confirmButtonText: "Continuar",
            }).then(() => {
              // Redirección según rol
              const redirectPath =
                userData.rol === "admin"
                  ? "/prueba"
                  : userData.rol === "vendor"
                  ? "/vendor"
                  : "/wellcome";

              router.push(redirectPath);
            });
          } else {
            setAuthData(null); // Limpiar contexto si falla
            Swal.fire({
              icon: "error",
              title: "Error de autenticación",
              text: "No se pudo completar el proceso de autenticación",
              confirmButtonColor: "#BF8D6B",
            });
            router.push("/users");
          }
        } catch (error) {
          setAuthData(null); // Limpiar contexto en errores
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

  return (
    <div className="text-center mt-4">
      <p className="text-[#EDEEF0] text-sm mb-2">Continua con Google</p>
      <button
        className="transparent flex items-center justify-center mx-auto border-0 hover:opacity-80 transition-opacity cursor-pointer"
        type="button"
        onClick={() => loginWithRedirect({ connection: "google-oauth2" })}
      >
        <Image
          src="/google-icon.svg"
          alt="Google Icon"
          width={40}
          height={40}
          className="hover:scale-110 transition-transform duration-200"
        />
      </button>
    </div>
  );
}
