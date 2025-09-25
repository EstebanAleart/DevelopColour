"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import Swal from "sweetalert2";
import apiUrls from "@/app/components/utils/apiConfig";
const API_URL = apiUrls;

export default function GraduadoCrearModal({ onClose, onSave }) {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    eventoId: "",
  });

  const [eventos, setEventos] = useState([]);
  const [filteredEventos, setFilteredEventos] = useState([]);
  const [searchEvento, setSearchEvento] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  // 🚀 Obtener eventos al montar
  useEffect(() => {
    const fetchEventos = async () => {
      try {
        const res = await fetch(
        `${API_URL}/api/evento`
        );
        const data = await res.json();
        if (data.success) {
          setEventos(data.data);
          setFilteredEventos(data.data);
        }
      } catch (err) {
        console.error("Error al obtener eventos:", err);
      }
    };
    fetchEventos();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 🔎 Filtro para autocomplete
  const handleSearchEvento = (e) => {
    const value = e.target.value;
    setSearchEvento(value);
    if (!value) {
      setFilteredEventos(eventos);
    } else {
      setFilteredEventos(
        eventos.filter((ev) =>
          ev.nombre.toLowerCase().includes(value.toLowerCase())
        )
      );
    }
    setShowDropdown(true);
  };

  const handleSelectEvento = (evento) => {
    setFormData((prev) => ({
      ...prev,
      eventoId: evento.id,
    }));
    setSearchEvento(evento.nombre); 
    setShowDropdown(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const userData = {
        nombre: formData.nombre,
        apellido: formData.apellido,
        rol: "graduado",
        eventoId: formData.eventoId, 
      };

      await onSave(userData);

      Swal.fire({
        icon: "success",
        title: "Usuario creado",
        text: "El usuario graduado ha sido creado exitosamente",
        timer: 2000,
        showConfirmButton: false,
      });

      setFormData({ nombre: "", apellido: "", eventoId: "" });
      setSearchEvento("");
      onClose();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `Error al crear el usuario: ${error.message}`,
      });
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-2 md:p-4">
      <div className="bg-[#1a1a1a] rounded-lg p-5 w-full max-w-xs md:max-w-md max-h-[95vh] overflow-y-auto shadow-lg">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            Crear Graduado
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form className="space-y-3" onSubmit={handleSubmit}>
          <div>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Nombre *"
              className="w-full p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#BF8D6B] text-sm"
              required
            />
          </div>

          <div>
            <input
              type="text"
              name="apellido"
              value={formData.apellido}
              onChange={handleChange}
              placeholder="Apellido *"
              className="w-full p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#BF8D6B] text-sm"
              required
            />
          </div>

          {/* 🔽 Autocomplete de Evento */}
          <div className="relative">
            <input
              type="text"
              value={searchEvento}
              onChange={handleSearchEvento}
              onFocus={() => setShowDropdown(true)}
              placeholder="Seleccionar evento *"
              className="w-full p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#BF8D6B] text-sm"
            
            />
            {showDropdown && filteredEventos.length > 0 && (
              <ul className="absolute z-10 w-full bg-[#2a2a2a] border border-[#BF8D6B] rounded mt-1 max-h-40 overflow-y-auto text-sm">
                {filteredEventos.map((ev) => (
                  <li
                    key={ev.id}
                    onClick={() => handleSelectEvento(ev)}
                    className="px-2 py-1 cursor-pointer hover:bg-[#BF8D6B] hover:text-white"
                  >
                    {ev.nombre} — {new Date(ev.fecha).toLocaleDateString()}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-sm text-white rounded border border-[#BF8D6B] bg-transparent hover:bg-[#BF8D6B] hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-sm font-bold rounded border border-[#BF8D6B] bg-[#BF8D6B] text-white hover:bg-[#a67454] transition-colors"
            >
              Crear
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
