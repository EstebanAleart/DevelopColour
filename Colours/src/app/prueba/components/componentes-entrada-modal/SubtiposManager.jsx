import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import FormularioSubtipo from "./FormularioSubtipo";
import ListaSubtipos from "./ListaSubtipos";
import ResumenDisponibilidad from "./ResumenDisponibilidad";

export default function SubtiposManager({ formData, setFormData, evento }) {
  const [showSubtipoForm, setShowSubtipoForm] = useState(false);
  const [currentSubtipo, setCurrentSubtipo] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    cantidad_disponible: "",
    edad_minima: "",
    edad_maxima: "",
    requiere_documentacion: false,
  });
  const [error, setError] = useState(null);

  const handleSubtipoChange = (e) => {
    const { name, value, type, checked } = e.target;

    setCurrentSubtipo({
      ...currentSubtipo,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const addSubtipo = () => {
    if (
      !currentSubtipo.nombre ||
      !currentSubtipo.precio ||
      !currentSubtipo.cantidad_disponible
    ) {
      setError("Nombre, precio y cantidad son obligatorios para el subtipo");
      return;
    }

    if (parseFloat(currentSubtipo.precio) <= 0) {
      setError("El precio del subtipo debe ser mayor que cero");
      return;
    }

    const nuevoSubtipo = {
      ...currentSubtipo,
      precio: parseFloat(currentSubtipo.precio),
      cantidad_disponible: parseInt(currentSubtipo.cantidad_disponible),
      edad_minima: currentSubtipo.edad_minima
        ? parseInt(currentSubtipo.edad_minima)
        : null,
      edad_maxima: currentSubtipo.edad_maxima
        ? parseInt(currentSubtipo.edad_maxima)
        : null,
    };

    setFormData({
      ...formData,
      subtipos: [...formData.subtipos, nuevoSubtipo],
    });

    // Resetear formulario de subtipo
    setCurrentSubtipo({
      nombre: "",
      descripcion: "",
      precio: "",
      cantidad_disponible: "",
      edad_minima: "",
      edad_maxima: "",
      requiere_documentacion: false,
    });

    setShowSubtipoForm(false);
    setError(null);
  };

  const removeSubtipo = (index) => {
    const nuevosSubtipos = [...formData.subtipos];
    nuevosSubtipos.splice(index, 1);
    setFormData({
      ...formData,
      subtipos: nuevosSubtipos,
    });
  };

  const calculateAvailableForGeneral = () => {
    const totalSubtipos = formData.subtipos.reduce(
      (total, subtipo) => total + parseInt(subtipo.cantidad_disponible),
      0
    );
    return formData.cantidad_total - totalSubtipos;
  };

  return (
    <div className="border-t border-[#BF8D6B] pt-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm md:text-base font-bold text-white">
          Subtipos de Entrada
        </h3>
        <button
          type="button"
          onClick={() => setShowSubtipoForm(!showSubtipoForm)}
          className="flex items-center text-[#BF8D6B] text-xs md:text-sm"
        >
          {showSubtipoForm ? (
            <>
              <Minus className="h-3 w-3 md:h-4 md:w-4 mr-1" />
              Ocultar formulario
            </>
          ) : (
            <>
              <Plus className="h-3 w-3 md:h-4 md:w-4 mr-1" />
              Agregar Subtipo
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="p-2 bg-red-900/50 text-red-300 text-xs rounded border border-red-700 mb-2">
          {error}
        </div>
      )}

      {showSubtipoForm && (
        <FormularioSubtipo
          currentSubtipo={currentSubtipo}
          handleSubtipoChange={handleSubtipoChange}
          addSubtipo={addSubtipo}
          maxCantidad={calculateAvailableForGeneral()}
        />
      )}

      <ListaSubtipos
        subtipos={formData.subtipos}
        removeSubtipo={removeSubtipo}
      />

      <ResumenDisponibilidad
        cantidadTotal={formData.cantidad_total}
        subtipos={formData.subtipos}
        calculateAvailableForGeneral={calculateAvailableForGeneral}
      />
    </div>
  );
}
