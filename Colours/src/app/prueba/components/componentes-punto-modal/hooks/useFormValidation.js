export const useFormValidation = () => {
  const validateCUIT = (cuit) => {
    const digits = cuit.replace(/-/g, "");
    if (digits.length !== 11) return false;
    const cuitPattern = /^\d{2}-?\d{8}-?\d{1}$/;
    return cuitPattern.test(cuit);
  };

  const validateForm = (formData) => {
    if (!formData.razon.trim()) return "La razón social es requerida";
    if (!formData.nombre.trim()) return "El nombre es requerido";
    if (!formData.direccion.trim()) return "La dirección es requerida";
    if (!formData.telefono.trim()) return "El teléfono es requerido";
    if (!/^\+?\d+$/.test(formData.telefono))
      return "El teléfono solo puede contener números y un + al inicio";
    if (!formData.cuit.trim()) return "El CUIT es requerido";

    const cleanCUIT = formData.cuit.replace(/-/g, "");
    if (cleanCUIT.length !== 11)
      return "El CUIT debe tener exactamente 11 dígitos";
    if (!validateCUIT(formData.cuit))
      return "El formato del CUIT es inválido (debe ser XX-XXXXXXXX-X)";
    if (!formData.email.trim()) return "El email es requerido";

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(formData.email))
      return "El formato del correo electrónico es inválido";

    return null;
  };

  return { validateForm, validateCUIT };
};
