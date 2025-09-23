import axios from "axios";
import Swal from "sweetalert2";
import { validateForm } from "./validation";

export const createAuth0User = async (formData) => {
  let domain = process.env.NEXT_PUBLIC_AUTH0_DOMAIN;
  const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;

  if (!domain || !clientId) {
    Swal.fire({
      icon: "error",
      title: "Error interno",
      text: "Por favor, contacta al administrador.",
    });
    return null;
  }

  domain = domain.replace(/^https?:\/\//, "");

  try {
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

    const auth0Id = auth0Response.data._id;
    if (!auth0Id) throw new Error("El ID de Auth0 es nulo o no válido.");

    return auth0Id;
  } catch (error) {
    throw error;
  }
};

export const checkUsernameAvailability = async (username, API_URL) => {
  try {
    const response = await fetch(`${API_URL}/api/users/verificar-usuario`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuario: username }),
    });

    if (!response.ok) {
      throw new Error("Error al verificar el nombre de usuario");
    }

    const data = await response.json();
    return !data.existe;
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "No se pudo verificar la disponibilidad del nombre de usuario.",
    });
    return false;
  }
};

export const handleFormSubmit = async (
  formData,
  userData,
  onSave,
  onClose,
  setLoading,
  API_URL
) => {
  if (!validateForm(formData, !!userData)) return;

  // Verificar disponibilidad del nombre de usuario antes de enviar
  if (!userData && formData.usuario) {
    const isUsernameAvailable = await checkUsernameAvailability(
      formData.usuario,
      API_URL
    );
    if (!isUsernameAvailable) {
      Swal.fire({
        icon: "warning",
        title: "Nombre de usuario no disponible",
        text: "El nombre de usuario ya está en uso. Por favor, elige otro.",
      });
      return;
    }
  }

  setLoading(true);

  try {
    let auth0Id = formData.auth0Id;

    if (!userData) {
      auth0Id = await createAuth0User(formData);
    }

    const userToSave = {
      ...formData,
      auth0Id,
      password: userData ? undefined : formData.password,
      rol: formData.rol || "comun", // Asegurar rol predeterminado
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

export const handleFieldChange = (name, value, setFormData) => {
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

export const handleFieldBlur = async (name, value, setFormData, API_URL) => {
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

  if (name === "usuario" && value) {
    const isUsernameAvailable = await checkUsernameAvailability(value, API_URL);
    if (!isUsernameAvailable) {
      Swal.fire({
        icon: "warning",
        title: "Nombre de usuario no disponible",
        text: "El nombre de usuario ya está en uso. Por favor, elige otro.",
      });
      setFormData((prev) => ({ ...prev, usuario: "" }));
    }
  }
};
