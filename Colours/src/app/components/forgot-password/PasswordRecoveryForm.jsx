"use client";

import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react"; // Importar Auth0
import InputField from "./InputField";
import ResetButton from "./ResetButton";
import TermsAndConditions from "./TermsAndCondition";
import GoogleLogin from "./GoogleLogin";
import BackLink from "./BackLink";
import Link from "next/link";

export default function PasswordRecoveryForm() {
  const { loginWithRedirect } = useAuth0(); // Obtener métodos de Auth0

  const handleForgotPassword = async () => {
    try {
      await loginWithRedirect({
        screen_hint: "reset-password", // Indicar a Auth0 que es para recuperación
      });
    } catch (error) {
      console.error("Error al recuperar contraseña:", error);
    }
  };

  return (
    <form className="flex flex-col gap-6">
      <InputField label="WhatsApp" id="whatsapp" type="text" />
      <InputField label="Nueva Contraseña" id="new-password" type="password" />
      <InputField
        label="Repetir Nueva Contraseña"
        id="repeat-password"
        type="password"
      />

      <ResetButton onClick={handleForgotPassword} />
      <TermsAndConditions />

      <div className="text-center">
        <span className="text-gray-300 text-sm">¿Ya tienes cuenta?</span>
        <Link
          href="/login"
          className="text-white hover:text-teal-400 text-sm transition-colors ml-1"
        >
          Inicia sesión
        </Link>
      </div>

      <GoogleLogin />
      <BackLink href="/" text="Volver atrás" />
    </form>
  );
}
