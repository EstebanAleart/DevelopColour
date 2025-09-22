import Swal from "sweetalert2";

export const useFormHandlers = (formData, setFormData) => {
  const handleBlur = (e) => {
    const { name, value } = e.target;
    if (name === "telefono") {
      const numericValue = value.replace(/\D/g, "");
      if (
        numericValue.length > 0 &&
        (numericValue.length < 9 || numericValue.length > 14)
      ) {
        Swal.fire({
          icon: "warning",
          title: "Advertencia",
          text: "El teléfono debe tener entre 9 y 14 dígitos.",
        });
      }
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "telefono") {
      const validatedValue = value.replace(/[^0-9+]/g, "");
      if (validatedValue.includes("+")) {
        const parts = validatedValue.split("+");
        if (parts.length > 2 || (parts.length === 2 && parts[0] !== "")) {
          return;
        }
      }
      setFormData((prev) => ({ ...prev, [name]: validatedValue }));
      return;
    }

    if (name === "cuit") {
      const digits = value.replace(/[^\d-]/g, "");
      const digitCount = digits.replace(/-/g, "").length;
      if (digitCount > 11) return;

      setFormData((prev) => ({ ...prev, [name]: digits }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  return { handleChange, handleBlur };
};
