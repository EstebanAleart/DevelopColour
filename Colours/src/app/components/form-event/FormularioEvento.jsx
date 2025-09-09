"use client";

import { useState } from "react";
import InputField from "./InputField";
import SubmitButton from "./SubmitButton";
import BackButton from "./BackButton";
import FormContainer from "./FormContainer";

export default function FormularioEvento() {
  const [formData, setFormData] = useState({
    dni: "",
    nombreApellido: "",
    direccion: "",
    email: "",
    whatsapp: "",
    usuario: "",
    contrasena: "",
    repetirContrasena: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí iría la lógica de envío del formulario
  };

  const handleGoBack = (e) => {
    e.preventDefault();
    window.history.back();
  };

  return (
    <FormContainer title="Formulario de pedido de evento">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 md:gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <InputField
            type="text"
            name="dni"
            placeholder="DNI"
            value={formData.dni}
            onChange={handleChange}
          />
          <InputField
            type="text"
            name="nombreApellido"
            placeholder="Nombre y Apellido"
            value={formData.nombreApellido}
            onChange={handleChange}
          />
        </div>

        <InputField
          type="text"
          name="direccion"
          placeholder="Dirección"
          value={formData.direccion}
          onChange={handleChange}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <InputField
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
          />
          <InputField
            type="text"
            name="whatsapp"
            placeholder="WhatsApp"
            value={formData.whatsapp}
            onChange={handleChange}
          />
        </div>

        <InputField
          type="text"
          name="usuario"
          placeholder="Usuario"
          value={formData.usuario}
          onChange={handleChange}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <InputField
            type="password"
            name="contrasena"
            placeholder="Contraseña"
            value={formData.contrasena}
            onChange={handleChange}
          />
          <InputField
            type="password"
            name="repetirContrasena"
            placeholder="Repetir Contraseña"
            value={formData.repetirContrasena}
            onChange={handleChange}
          />
        </div>

        <div className="mt-2 md:mt-4">
          <SubmitButton text="Registrarme" />
        </div>
      </form>

      <div className="mt-6 md:mt-10">
        <BackButton onClick={handleGoBack} />
      </div>
    </FormContainer>
  );
}
