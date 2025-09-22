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

export const validateForm = (formData) => {
  if (formData.telefono && !/^\+?\d+$/.test(formData.telefono)) {
    return "El teléfono solo puede contener números y un + al inicio";
  }

  const formattedCUIT = formatCUIT(formData.cuit);
  const cuitPattern = /^\d{2}-\d{8}-\d{1}$/;
  if (!cuitPattern.test(formattedCUIT)) {
    return "El CUIT debe tener 11 dígitos con formato XX-XXXXXXXX-X";
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(formData.email)) {
    return "El formato del correo electrónico es inválido";
  }

  return null;
};
