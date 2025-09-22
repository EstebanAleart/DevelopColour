export const getTodayString = () => {
  const today = new Date();
  const localDate = new Date(
    today.getTime() - today.getTimezoneOffset() * 60000
  );
  return localDate.toISOString().slice(0, 16);
};

export const validateCapacity = (formData, salones, setCapacidadError) => {
  const selectedSalon = salones.find((salon) => salon.Id === formData.salonId);

  if (
    selectedSalon?.capacidad &&
    formData.capacidad > selectedSalon.capacidad
  ) {
    setCapacidadError(
      `La capacidad del evento (${formData.capacidad}) supera la capacidad máxima del salón (${selectedSalon.capacidad}).`
    );
    return false;
  }

  setCapacidadError("");
  return true;
};
