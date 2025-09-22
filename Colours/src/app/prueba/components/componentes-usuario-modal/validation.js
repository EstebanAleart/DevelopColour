import Swal from "sweetalert2";

export const validateRequiredFields = (formData, isEditing) => {
  if (
    !formData.nombre ||
    !formData.apellido ||
    !formData.usuario ||
    (!isEditing && !formData.password)
  ) {
    Swal.fire({
      icon: "warning",
      title: "Campos incompletos",
      text: "Los campos marcados como obligatorios son requeridos.",
    });
    return false;
  }
  return true;
};

export const validateDNI = (dni) => {
  if (dni) {
    const dniRegex = /^[0-9]+[MF]?$/;
    if (!dniRegex.test(dni)) {
      Swal.fire({
        icon: "warning",
        title: "DNI inválido",
        text: "El DNI debe contener solo números, opcionalmente seguido por la letra M o F.",
      });
      return false;
    }
  }
  return true;
};

export const validateEmail = (email) => {
  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Swal.fire({
        icon: "warning",
        title: "Correo inválido",
        text: "Por favor, ingresa un correo electrónico válido.",
      });
      return false;
    }
  }
  return true;
};

export const validatePassword = (password, isEditing) => {
  if (!isEditing) {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    if (!passwordRegex.test(password)) {
      Swal.fire({
        icon: "warning",
        title: "Contraseña inválida",
        text: "La contraseña debe tener al menos 8 caracteres, incluyendo letras mayúsculas, minúsculas, números y caracteres especiales.",
      });
      return false;
    }
  }
  return true;
};

export const validateForm = (formData, isEditing) => {
  return (
    validateRequiredFields(formData, isEditing) &&
    validateDNI(formData.dni) &&
    validateEmail(formData.email) &&
    validatePassword(formData.password, isEditing)
  );
};
