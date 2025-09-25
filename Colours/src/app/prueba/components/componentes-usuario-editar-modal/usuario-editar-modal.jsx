"use client";

import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import apiUrls from "@/app/components/utils/apiConfig";

import { useUsuarioForm } from "./hook/useUsuarioForm";
import { FormField } from "./FormField";
import { FormGrid } from "./FormGrid";
import { Modal } from "./Modal";
import { ModalHeader } from "./ModalHeader";

const API_URL = apiUrls;

export default function UsuarioEditarModal({ usuario, onClose, onSave }) {
  const { formData, loading, error, isSubmitting, handleChange, handleSubmit, setFormData } =
    useUsuarioForm(usuario, onSave, onClose);

  const [eventos, setEventos] = useState([]);
  const [filteredEventos, setFilteredEventos] = useState([]);
  const [searchEvento, setSearchEvento] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  // 🚀 Obtener eventos al montar
  useEffect(() => {
    const fetchEventos = async () => {
      try {
        const res = await fetch(`${API_URL}/api/evento`);
        const data = await res.json();
        if (data.success) {
          setEventos(data.data);
          setFilteredEventos(data.data);

          // Si el usuario ya tiene evento asignado, setearlo
          if (usuario?.eventoId) {
            const eventoSel = data.data.find((ev) => ev.id === usuario.eventoId);
            if (eventoSel) setSearchEvento(eventoSel.nombre);
          }
        }
      } catch (err) {
        console.error("Error al obtener eventos:", err);
      }
    };
    fetchEventos();
  }, [usuario]);

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
      eventId: evento.id,
    }));
    setSearchEvento(evento.nombre);
    setShowDropdown(false);
  };

  return (
    <Modal onClose={onClose}>
      <ModalHeader title="Editar Usuario" onClose={onClose} />

      {error && (
        <div className="p-2 md:p-2 bg-red-900/50 text-red-300 text-xs rounded border border-red-700 mb-3 md:mb-3">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-2 md:space-y-3">
        <FormField
          type="text"
          name="usuario"
          placeholder="Usuario *"
          value={formData.usuario}
          onChange={handleChange}
        
        />

        <FormGrid>
          <FormField
            type="text"
            name="nombre"
            placeholder="Nombre *"
            value={formData.nombre}
            onChange={handleChange}
            required
          />
          <FormField
            type="text"
            name="apellido"
            placeholder="Apellido *"
            value={formData.apellido}
            onChange={handleChange}
            required
          />
          <FormField
            type="text"
            name="dni"
            placeholder="DNI"
            value={formData.dni}
            onChange={handleChange}
          />
          <FormField
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
          />
          <FormField
            type="text"
            name="direccion"
            placeholder="Dirección"
            value={formData.direccion}
            onChange={handleChange}
          />
          <FormField
            type="text"
            name="whatsapp"
            placeholder="WhatsApp"
            value={formData.whatsapp}
            onChange={handleChange}
          />
          <FormField type="password" name="password" placeholder="Contraseña" />
          <FormField
            type="password"
            name="repeatPassword"
            placeholder="Repetir Contraseña"
          />
        </FormGrid>

        {/* 🔽 Autocomplete de Evento */}
        <div className="relative">
          <input
            type="text"
            value={searchEvento}
            onChange={handleSearchEvento}
            onFocus={() => setShowDropdown(true)}
            placeholder="Seleccionar evento"
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

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-2 md:gap-3 pt-2 md:pt-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full font-bold py-2 md:py-2 px-2 rounded bg-transparent text-white border border-[#BF8D6B] text-xs md:text-sm"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="w-full font-bold py-2 md:py-2 px-2 rounded bg-[#BF8D6B] text-white text-xs md:text-sm"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

