import Swal from "sweetalert2";

export const validateWhatsApp = (value) => {
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
};

export const validateCUIT = (cuit) => {
  const formattedCUIT = formatCUIT(cuit);
  const cuitPattern = /^\d{2}-\d{8}-\d{1}$/;
  if (!cuitPattern.test(formattedCUIT)) {
    throw new Error("El CUIT debe tener 11 dígitos con formato XX-XXXXXXXX-X");
  }
};

export const validateEmail = (email) => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    throw new Error("El formato del correo electrónico es inválido");
  }
};

export const formatCUIT = (cuit) => {
  const digits = cuit.replace(/\D/g, "");
  if (digits.length === 11) {
    return `${digits.substring(0, 2)}-${digits.substring(
      2,
      10
    )}-${digits.substring(10)}`;
  }
  return digits;
};
