"use client";

import { useState } from "react";
import { Plus, ChevronRight } from "lucide-react";
import Header from "../../../components/header";
import GraduadoCrearModal from "../../../components/componentes-usuarios/graduado-crear-modal";

export default function Graduados({ params }) {
  const [showModal, setShowModal] = useState(false); // Controlar la visibilidad del modal
  const [currentPage, setCurrentPage] = useState(1); // Controlar la página actual para la paginación

  // Datos de ejemplo de graduados
  const graduados = [
    {
      id: 1,
      nombre: "Juan Pérez",
      dni: "36999888",
      email: "juan@gmail.com",
      direccion: "Calle Falsa 123",
      whatsapp: "3413111888",
      codigoUsuario: "Código",
      codigoEvento: "Código",
    },
    {
      id: 2,
      nombre: "Juan Pérez",
      dni: "36999888",
      email: "juan@gmail.com",
      direccion: "Calle Falsa 123",
      whatsapp: "3413111888",
      codigoUsuario: "Código",
      codigoEvento: "Código",
    },
    {
      id: 3,
      nombre: "Juan Pérez",
      dni: "36999888",
      email: "juan@gmail.com",
      direccion: "Calle Falsa 123",
      whatsapp: "3413111888",
      codigoUsuario: "Código",
      codigoEvento: "Código",
    },
    {
      id: 4,
      nombre: "Juan Pérez",
      dni: "36999888",
      email: "juan@gmail.com",
      direccion: "Calle Falsa 123",
      whatsapp: "3413111888",
      codigoUsuario: "Código",
      codigoEvento: "Código",
    },
    {
      id: 5,
      nombre: "Juan Pérez",
      dni: "36999888",
      email: "juan@gmail.com",
      direccion: "Calle Falsa 123",
      whatsapp: "3413111888",
      codigoUsuario: "Código",
      codigoEvento: "Código",
    },
    {
      id: 6,
      nombre: "Juan Pérez",
      dni: "36999888",
      email: "juan@gmail.com",
      direccion: "Calle Falsa 123",
      whatsapp: "3413111888",
      codigoUsuario: "Código",
      codigoEvento: "Código",
    },
    {
      id: 7,
      nombre: "Juan Pérez",
      dni: "36999888",
      email: "juan@gmail.com",
      direccion: "Calle Falsa 123",
      whatsapp: "3413111888",
      codigoUsuario: "Código",
      codigoEvento: "Código",
    },
    {
      id: 8,
      nombre: "Juan Pérez",
      dni: "36999888",
      email: "juan@gmail.com",
      direccion: "Calle Falsa 123",
      whatsapp: "3413111888",
      codigoUsuario: "Código",
      codigoEvento: "Código",
    },
    {
      id: 9,
      nombre: "Juan Pérez",
      dni: "36999888",
      email: "juan@gmail.com",
      direccion: "Calle Falsa 123",
      whatsapp: "3413111888",
      codigoUsuario: "Código",
      codigoEvento: "Código",
    },
    {
      id: 10,
      nombre: "Juan Pérez",
      dni: "36999888",
      email: "juan@gmail.com",
      direccion: "Calle Falsa 123",
      whatsapp: "3413111888",
      codigoUsuario: "Código",
      codigoEvento: "Código",
    },
  ];

  return (
    <div className="p-6">
      {/* Header con el título y botón de regreso */}
      <Header title="Sagrado Corazón Turno Mañana 2025" showBack={true} />

      {/* Sección de filtro y agregar graduado */}
      <div className="flex justify-between items-center mb-6">
        <button className="btn btn-outline">Cargar CSV</button>

        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Código de Usuario"
            className="input w-48"
          />
          <input
            type="text"
            placeholder="Código de Evento"
            className="input w-48"
          />
          <button
            className="btn btn-primary flex items-center gap-2"
            onClick={() => setShowModal(true)} // Mostrar modal al hacer clic
          >
            <Plus className="h-4 w-4" />
            Agregar
          </button>
        </div>
      </div>

      {/* Tabla de graduados */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th className="w-10">
                <input type="checkbox" />
              </th>
              <th>Nombre y Apellido</th>
              <th>DNI</th>
              <th>Email</th>
              <th>Dirección</th>
              <th>WhatsApp</th>
              <th>Máximo de Tarjetas</th>
              <th>Código de Usuario</th>
              <th>Código de Evento</th>
            </tr>
          </thead>
          <tbody>
            {graduados.map((graduado) => (
              <tr key={graduado.id}>
                <td>
                  <input type="checkbox" />
                </td>
                <td>{graduado.nombre}</td>
                <td>{graduado.dni}</td>
                <td>{graduado.email}</td>
                <td>{graduado.direccion}</td>
                <td>{graduado.whatsapp}</td>
                <td>
                  <button className="btn btn-outline py-1 px-2">Ver</button>
                </td>
                <td>{graduado.codigoUsuario}</td>
                <td>{graduado.codigoEvento}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="pagination mt-4">
        <button className="pagination-item active">1</button>
        <button className="pagination-item">2</button>
        <button className="pagination-item">3</button>
        <button className="pagination-item">4</button>
        <button className="pagination-item">5</button>
        <button className="pagination-item">30</button>
        <button className="pagination-item">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Modal para agregar un nuevo graduado */}
      {showModal && <GraduadoCrearModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
