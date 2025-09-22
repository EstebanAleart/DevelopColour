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

export const handleFormSubmit = async (
  formData,
  userData,
  onSave,
  onClose,
  setLoading
) => {
  if (!validateForm(formData, !!userData)) return;

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

export const handleFieldBlur = (name, value) => {
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
