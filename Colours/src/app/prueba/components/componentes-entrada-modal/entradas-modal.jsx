"use client";

import { useState } from "react";
import { X, Check } from "lucide-react";
import Swal from "sweetalert2";
import apiUrls from "@/app/components/utils/apiConfig";
import EventoDetalles from "./EventoDetalles";
import FormularioPrincipal from "./FormularioPrincipal";
import SubtiposManager from "./SubtiposManager";

const API_URL = apiUrls;

export default function EntradasModal({ evento, onClose }) {
  const [formData, setFormData] = useState({
    tipo_entrada: "",
    descripcion: "",
    cantidad_total: evento.capacidad || 0,
    fecha_inicio_venta: "",
    fecha_fin_venta: "",
    estatus: "disponible",
    subtipos: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones
    if (!formData.tipo_entrada.trim()) {
      setError("El tipo de entrada es obligatorio");
      return;
    }

    if (!formData.cantidad_total || formData.cantidad_total <= 0) {
      setError("La cantidad total debe ser mayor que cero");
      return;
    }

    // Validar que la suma de subtipos no exceda la cantidad total
    const totalSubtipos = formData.subtipos.reduce(
      (total, subtipo) => total + parseInt(subtipo.cantidad_disponible),
      0
    );

    if (totalSubtipos > formData.cantidad_total) {
      setError(
        `La suma de los subtipos (${totalSubtipos}) excede la cantidad total (${formData.cantidad_total})`
      );
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const entradaData = {
        tipo_entrada: formData.tipo_entrada,
        descripcion: formData.descripcion,
        cantidad_total: parseInt(formData.cantidad_total),
        fecha_inicio_venta: formData.fecha_inicio_venta || null,
        fecha_fin_venta: formData.fecha_fin_venta || null,
        estatus: formData.estatus,
        eventoId: evento.id,
        subtipos: formData.subtipos,
      };

      const response = await fetch(`${API_URL}/api/entrada/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(entradaData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al crear la entrada");
      }

      const result = await response.json();

      Swal.fire({
        title: "¡Entradas Creadas!",
        text: result.message,
        icon: "success",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#BF8D6B",
        timer: 3000,
        timerProgressBar: true,
      });

      onClose();
    } catch (err) {
      console.error("Error al crear entrada:", err);
      setError(err.message || "No se pudo crear la entrada");

      Swal.fire({
        title: "Error",
        text:
          err.message ||
          "No se pudieron crear las entradas. Intente nuevamente.",
        icon: "error",
        confirmButtonText: "Entendido",
        confirmButtonColor: "#b91c1c",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-2 md:p-4 ">
      <div className="bg-[#1a1a1a] rounded-lg p-3 md:p-4 w-full max-w-xs md:max-w-3xl max-h-[95vh] overflow-y-auto shadow-lg">
        <div className="flex justify-between items-center mb-3 md:mb-3">
          <h2 className="text-base md:text-lg font-bold text-white">
            Crear Tipo de Entrada
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 md:p-0"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4 md:h-5 md:w-5" />
          </button>
        </div>

        <EventoDetalles evento={evento} />

        {error && (
          <div className="p-2 md:p-2 bg-red-900/50 text-red-300 text-xs md:text-sm rounded border border-red-700 mb-3 md:mb-3 flex items-start">
            <AlertCircle className="h-3 w-3 md:h-4 md:w-4 mr-1 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormularioPrincipal
            formData={formData}
            handleChange={handleChange}
            evento={evento}
          />

          <SubtiposManager
            formData={formData}
            setFormData={setFormData}
            evento={evento}
          />

          <div className="pt-4 border-t border-[#BF8D6B]">
            <button
              type="submit"
              className="w-full font-bold py-2 md:py-2 px-2 rounded bg-[#BF8D6B] text-white text-xs md:text-sm flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                "Creando..."
              ) : (
                <>
                  <Check className="h-3 w-3 md:h-4 md:w-4" />
                  <span>Crear Tipo de Entrada</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
