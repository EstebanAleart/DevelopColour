"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import InputField from "./InputField"
import Swal from "sweetalert2"
import apiUrls from "../utils/apiConfig"

const API_URL = apiUrls

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
  })

  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleBlur = (e) => {
    const { id, value } = e.target

    // Validación especial para WhatsApp al perder el foco
    if (id === "whatsapp") {
      const numericValue = value.replace(/\D/g, "")
      if (numericValue.length > 0 && (numericValue.length < 9 || numericValue.length > 14)) {
        Swal.fire({
          icon: "warning",
          title: "Advertencia",
          text: "El WhatsApp debe tener entre 9 y 14 dígitos.",
        })
      }
    }

    // Validación especial para DNI al perder el foco
    if (id === "dni") {
      const numericValue = value.replace(/[MF]/gi, "")
      if (numericValue.length > 0 && (numericValue.length < 9 || numericValue.length > 14)) {
        Swal.fire({
          icon: "warning",
          title: "Advertencia",
          text: "El DNI debe tener entre 9 y 14 caracteres.",
        })
      }
    }
  }

  const handleChange = (e) => {
    const { id, value } = e.target

    // Validación especial para DNI
    if (id === "dni") {
      const sanitizedValue = value.replace(/[^0-9MF]/gi, "")
      setFormData((prevData) => ({ ...prevData, [id]: sanitizedValue }))
    }
    // Validación especial para WhatsApp
    else if (id === "whatsapp") {
      const sanitizedValue = value.replace(/[^0-9+]/g, "")
      setFormData((prevData) => ({ ...prevData, [id]: sanitizedValue }))
    } else {
      setFormData((prevData) => ({ ...prevData, [id]: value }))
    }
  }

  const handleRegister = async () => {
    const { dni, nombre, apellido, direccion, email, whatsapp, usuario, password, confirmPassword, isActive } = formData

    // Validación de campos obligatorios (solo los que siguen siendo requeridos)
    if (!nombre || !apellido || !usuario || !password || !confirmPassword) {
      Swal.fire({
        icon: "warning",
        title: "Campos incompletos",
        text: "Los campos marcados como obligatorios son requeridos.",
      })
      return
    }

    // Validación específica del DNI solo si se proporciona
    if (dni) {
      const dniRegex = /^[0-9]+[MF]?$/
      if (!dniRegex.test(dni)) {
        Swal.fire({
          icon: "warning",
          title: "DNI inválido",
          text: "El DNI debe contener solo números, opcionalmente seguido por la letra M o F.",
        })
        return
      }
    }

    // Validación de email solo si se proporciona
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        Swal.fire({
          icon: "warning",
          title: "Correo inválido",
          text: "Por favor, ingresa un correo electrónico válido.",
        })
        return
      }
    }

    if (password !== confirmPassword) {
      Swal.fire({
        icon: "warning",
        title: "Contraseñas no coinciden",
        text: "Las contraseñas no coinciden.",
      })
      return
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/
    if (!passwordRegex.test(password)) {
      Swal.fire({
        icon: "warning",
        title: "Contraseña inválida",
        text: "La contraseña debe tener al menos 8 caracteres, incluyendo letras mayúsculas, minúsculas, números y caracteres especiales.",
      })
      return
    }

    setLoading(true)

    try {
      // Registro en Auth0
      let domain = process.env.NEXT_PUBLIC_AUTH0_DOMAIN
      const clientId = process.env.NEXT_PUBLIC_CLIENT_ID

      if (!domain || !clientId) {
        console.error("Las variables de entorno de Auth0 no están configuradas.")
        Swal.fire({
          icon: "error",
          title: "Error interno",
          text: "Por favor, contacta al administrador.",
        })
        return
      }

      domain = domain.replace(/^https?:\/\//, "")

      const auth0Response = await axios.post(
        `https://${domain}/dbconnections/signup`,
        {
          client_id: clientId,
          email: email || `${usuario}@temp.com`, // Usar email temporal si no se proporcionó
          password,
          connection: "Username-Password-Authentication",
        },
        {
          headers: { "Content-Type": "application/json" },
        },
      )

      console.log("Registro exitoso en Auth0:", auth0Response.data)
      const auth0Id = auth0Response.data._id

      if (!auth0Id) {
        throw new Error("El ID de Auth0 es nulo o no válido.")
      }

      // Registro en el backend
      const backendData = {
        dni,
        nombre,
        apellido,
        direccion,
        email: email || `${usuario}@temp.com`, // Usar email temporal si no se proporcionó
        whatsapp,
        usuario,
        password,
        isActive,
        auth0Id,
      }

      console.log("Datos enviados al backend:", backendData)

      const backendResponse = await axios.post(`${API_URL}/api/users/register`, backendData, {
        headers: { "Content-Type": "application/json" },
      })

      console.log("Registro exitoso en el backend:", backendResponse.data)
      Swal.fire({
        icon: "success",
        title: "Registro exitoso",
        text: "¡Bienvenido!",
      })
      router.push("/")
    } catch (err) {
      console.error("Error de registro:", err.response?.data || err.message)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.message || "Error al registrarse. Por favor, inténtalo de nuevo.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField label="Nombre *" type="text" id="nombre" value={formData.nombre} onChange={handleChange} required />
        <InputField
          label="Apellido *"
          type="text"
          id="apellido"
          value={formData.apellido}
          onChange={handleChange}
          required
        />
        <InputField
          label="DNI (Opcional)"
          type="text"
          id="dni"
          value={formData.dni}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Solo números y opcionalmente M o F"
        />
        <InputField
          label="Correo Electrónico (Opcional)"
          type="email"
          id="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Si no proporcionas uno, se generará automáticamente"
        />
        <InputField
          label="Usuario *"
          type="text"
          id="usuario"
          value={formData.usuario}
          onChange={handleChange}
          required
        />
        <InputField
          label="Dirección (Opcional)"
          type="text"
          id="direccion"
          value={formData.direccion}
          onChange={handleChange}
        />
        <InputField
          label="WhatsApp (Opcional)"
          type="text"
          id="whatsapp"
          value={formData.whatsapp}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Formato: +549XXXXXXXXXX"
        />
        <InputField
          label="Contraseña *"
          type="password"
          id="password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <InputField
          label="Repetir Contraseña *"
          type="password"
          id="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />
      </div>

      <button
        type="button"
        onClick={handleRegister}
        disabled={loading}
        className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 ${
          loading
            ? "bg-gray-600 text-gray-400 cursor-not-allowed"
            : "bg-gradient-to-rclassName= bg-[#BF8D6B] hover:bg-[#BF8D6B]/90 text-white  shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        }`}
      >
        {loading ? "Cargando..." : "Registrarse"}
      </button>
    </form>
  )
}

