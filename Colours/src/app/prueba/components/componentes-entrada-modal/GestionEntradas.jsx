"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  DollarSign,
  UserCheck,
  AlertCircle,
  Check,
} from "lucide-react";
import Swal from "sweetalert2";
import EntradasModal from "./entradas-modal";
import EntradaModal from "./EntradaModal";
import SubtipoForm from "../componentes-evento-editar-modal/SubtipoForm";

export default function GestionEntradas({ evento, API_URL, setActiveTab }) {
  const [entradas, setEntradas] = useState([]);
  const [loadingEntradas, setLoadingEntradas] = useState(false);
  const [errorEntradas, setErrorEntradas] = useState(null);
  const [showAddEntradaModal, setShowAddEntradaModal] = useState(false);
  const [showEditEntradaModal, setShowEditEntradaModal] = useState(false);
  const [entradaSeleccionada, setEntradaSeleccionada] = useState(null);
  const [showSubtipoForm, setShowSubtipoForm] = useState(false);
  const [subtipoEntradaId, setSubtipoEntradaId] = useState(null);
  const [currentSubtipo, setCurrentSubtipo] = useState({
    id: null,
    nombre: "",
    descripcion: "",
    precio: "",
    cantidad_disponible: "",
    edad_minima: "",
    edad_maxima: "",
    requiere_documentacion: false,
  });
  const [isEditingSubtipo, setIsEditingSubtipo] = useState(false);

  useEffect(() => {
    if (evento?.id) {
      fetchEntradas();
    }
  }, [evento?.id]);

  const fetchEntradas = async () => {
    setLoadingEntradas(true);
    setErrorEntradas(null);
    try {
      const res = await fetch(`${API_URL}/api/entrada/${evento.id}`);
      if (!res.ok) throw new Error("No se pudieron obtener las entradas");

      const data = await res.json();

      if (data.success && data.data) {
        setEntradas(data.data);
      } else if (Array.isArray(data)) {
        setEntradas(data);
      } else {
        setEntradas([]);
      }
    } catch (err) {
      setErrorEntradas(err.message || "Error al obtener entradas");
    } finally {
      setLoadingEntradas(false);
    }
  };

  const handleEliminarEntrada = async (entradaId) => {
    const result = await Swal.fire({
      title: "¿Eliminar tipo de entrada?",
      text: "Esta acción eliminará todos los subtipos asociados. ¿Deseas continuar?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    setLoadingEntradas(true);
    setErrorEntradas(null);
    try {
      const res = await fetch(`${API_URL}/api/entrada/${entradaId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("No se pudo eliminar la entrada");

      Swal.fire({
        icon: "success",
        title: "Tipo de entrada eliminado",
        text: "El tipo de entrada y sus subtipos han sido eliminados correctamente.",
      });

      fetchEntradas();
    } catch (err) {
      setErrorEntradas(err.message || "Error al eliminar entrada");
    } finally {
      setLoadingEntradas(false);
    }
  };

  const handleEliminarSubtipo = async (subtipoId, subtipoNombre) => {
    const result = await Swal.fire({
      title: "¿Eliminar subtipo?",
      text: `¿Estás seguro de que deseas eliminar el subtipo "${subtipoNombre}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    setLoadingEntradas(true);
    setErrorEntradas(null);
    
    try {
      const res = await fetch(`${API_URL}/api/entrada/subtipo/${subtipoId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "No se pudo eliminar el subtipo");
      }

      Swal.fire({
        icon: "success",
        title: "Subtipo eliminado",
        text: "El subtipo ha sido eliminado correctamente.",
      });

      fetchEntradas();
    } catch (err) {
      setErrorEntradas(err.message || "Error al eliminar subtipo");
    } finally {
      setLoadingEntradas(false);
    }
  };

  const handleEditarEntrada = (entrada) => {
    setEntradaSeleccionada(entrada);
    setShowEditEntradaModal(true);
  };

  const handleAgregarSubtipo = (entradaId) => {
    setSubtipoEntradaId(entradaId);
    setShowSubtipoForm(true);
    setIsEditingSubtipo(false);
    setCurrentSubtipo({
      id: null,
      nombre: "",
      descripcion: "",
      precio: "",
      cantidad_disponible: "",
      edad_minima: "",
      edad_maxima: "",
      requiere_documentacion: false,
    });
  };

  const handleEditarSubtipo = (entradaId, subtipo) => {
    
    setSubtipoEntradaId(entradaId);
    setShowSubtipoForm(true);
    setIsEditingSubtipo(true);
    setCurrentSubtipo({
      id: subtipo.id,
      nombre: subtipo.nombre || "",
      descripcion: subtipo.descripcion || "",
      precio: subtipo.precio !== undefined ? subtipo.precio.toString() : "",
      cantidad_disponible:
        subtipo.cantidad_disponible !== undefined
          ? subtipo.cantidad_disponible.toString()
          : "",
      edad_minima:
        subtipo.edad_minima !== undefined ? subtipo.edad_minima.toString() : "",
      edad_maxima:
        subtipo.edad_maxima !== undefined ? subtipo.edad_maxima.toString() : "",
      requiere_documentacion: subtipo.requiere_documentacion || false,
    });
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm md:text-base font-semibold text-white mb-2">
        Tipos de Entrada del Evento
      </h3>

      <div className="mb-3">
        <button
          onClick={() => setShowAddEntradaModal(true)}
          className="px-3 py-2 bg-[#BF8D6B] hover:bg-[#a67454] text-white rounded text-xs flex items-center gap-1"
        >
          <Plus className="h-3 w-3" />
          <span>Agregar Tipo de Entrada</span>
        </button>
      </div>

      {errorEntradas && (
        <div className="p-2 bg-red-900/50 text-red-300 text-xs rounded border border-red-700 mb-2">
          {errorEntradas}
        </div>
      )}

      {loadingEntradas ? (
        <div className="py-4 md:py-6 text-center text-[#BF8D6B]">
          <div className="animate-spin h-5 w-5 md:h-6 md:w-6 mx-auto mb-2 border-2 border-[#BF8D6B] border-t-transparent rounded-full"></div>
          <p className="text-xs">Cargando entradas...</p>
        </div>
      ) : (
        <>
          {entradas.length > 0 ? (
            <div className="space-y-4">
              {entradas.map((entrada) => (
                <div
                  key={entrada.id}
                  className="border border-[#BF8D6B] rounded p-3 bg-gray-900"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="text-[#BF8D6B] font-medium text-sm">
                        {entrada.tipo_entrada}
                      </h4>
                      <p className="text-gray-400 text-xs">
                        {entrada.descripcion || "Sin descripción"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="text-blue-400 hover:text-blue-300 text-xs"
                        onClick={() => handleEditarEntrada(entrada)}
                        title="Editar entrada"
                      >
                        <Edit className="h-3 w-3" />
                      </button>
                      <button
                        className="text-red-400 hover:text-red-300 text-xs"
                        onClick={() => handleEliminarEntrada(entrada.id)}
                        title="Eliminar entrada"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                    <div>
                      <span className="text-gray-400">Total: </span>
                      <span className="text-white">
                        {entrada.cantidad_total}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Disponible: </span>
                      <span className="text-white">
                        {entrada.cantidad_real}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Precio: </span>
                      <span className="text-white">
                        {entrada.subtipos && entrada.subtipos.length > 0
                          ? (() => {
                              const preciosValidos = entrada.subtipos
                                .map((subtipo) => subtipo.precio)
                                .filter(
                                  (precio) =>
                                    typeof precio === "number" && !isNaN(precio)
                                );
                              if (preciosValidos.length === 0)
                                return "N/A (Subtipos)";
                              const minPrecio = Math.min(...preciosValidos);
                              const maxPrecio = Math.max(...preciosValidos);
                              return minPrecio === maxPrecio
                                ? `$${minPrecio}`
                                : `$${minPrecio} - $${maxPrecio}`;
                            })()
                          : entrada.resumen.precio
                          ? `$${entrada.resumen.precio}`
                          : "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Estatus: </span>
                      <span
                        className={`${
                          entrada.estatus === "disponible"
                            ? "text-green-400"
                            : entrada.estatus === "agotado"
                            ? "text-red-400"
                            : entrada.estatus === "suspendido"
                            ? "text-yellow-400"
                            : "text-gray-400"
                        }`}
                      >
                        {entrada.estatus}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Subtipos: </span>
                      <span className="text-white">
                        {entrada.subtipos?.length || 0}
                      </span>
                    </div>
                  </div>

                  {entrada.subtipos && entrada.subtipos.length > 0 && (
                    <div className="mt-3">
                      <h5 className="text-gray-400 text-xs font-medium mb-2">
                        Subtipos:
                      </h5>
                      <div className="space-y-2">
                        {entrada.subtipos.map((subtipo) => (
                          <div
                            key={subtipo.id}
                            className="bg-gray-800 p-2 rounded text-xs"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="text-white font-medium">
                                  {subtipo.nombre}
                                </div>
                                {subtipo.descripcion && (
                                  <div className="text-gray-400 text-xs mt-1">
                                    {subtipo.descripcion}
                                  </div>
                                )}
                              </div>
                              <div className="flex gap-1">
                                <button
                                  className="text-blue-400 hover:text-blue-300"
                                  onClick={() =>
                                    handleEditarSubtipo(entrada.id, subtipo)
                                  }
                                  title="Editar subtipo"
                                >
                                  <Edit className="h-3 w-3" />
                                </button>
                                <button
                                  className="text-red-400 hover:text-red-300"
                                  onClick={() =>
                                    handleEliminarSubtipo(
                                      subtipo.id,
                                      subtipo.nombre
                                    )
                                  }
                                  title="Eliminar subtipo"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-1 mt-2">
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3 text-[#BF8D6B]" />
                                <span>${subtipo.precio}</span>
                              </div>
                              <div>
                                <span className="text-gray-400">
                                  Disponible:{" "}
                                </span>
                                <span className="text-white">
                                  {subtipo.cantidad_disponible}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-400">
                                  Vendidas:{" "}
                                </span>
                                <span className="text-white">
                                  {subtipo.cantidad_vendida || 0}
                                </span>
                              </div>
                              {subtipo.edad_minima && (
                                <div className="flex items-center gap-1">
                                  <UserCheck className="h-3 w-3 text-[#BF8D6B]" />
                                  <span>
                                    Edad: {subtipo.edad_minima}
                                    {subtipo.edad_maxima
                                      ? `-${subtipo.edad_maxima}`
                                      : "+"}
                                  </span>
                                </div>
                              )}
                              {subtipo.requiere_documentacion && (
                                <div className="flex items-center gap-1 col-span-2 text-yellow-400">
                                  <AlertCircle className="h-3 w-3" />
                                  <span>Requiere documentación</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => handleAgregarSubtipo(entrada.id)}
                      className="px-2 py-1 bg-[#BF8D6B] hover:bg-[#a67454] text-white rounded text-xs flex items-center gap-1"
                    >
                      <Plus className="h-3 w-3" />
                      <span>Agregar Subtipo</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-4 text-center text-gray-400 border border-dashed border-gray-600 rounded text-xs md:text-sm">
              No hay tipos de entrada para este evento.
            </div>
          )}
        </>
      )}

      {showSubtipoForm && (
        <SubtipoForm
          currentSubtipo={currentSubtipo}
          setCurrentSubtipo={setCurrentSubtipo}
          subtipoEntradaId={subtipoEntradaId}
          isEditingSubtipo={isEditingSubtipo}
          setShowSubtipoForm={setShowSubtipoForm}
          loadingEntradas={loadingEntradas}
          errorEntradas={errorEntradas}
          setErrorEntradas={setErrorEntradas}
          fetchEntradas={fetchEntradas}
          API_URL={API_URL}
        />
      )}

      <div className="flex justify-end mt-3">
        <button
          type="button"
          onClick={() => setActiveTab("info")}
          className="px-2 py-1 md:px-3 md:py-1 text-[#BF8D6B] hover:text-[#a67454] border border-[#BF8D6B] rounded text-xs transition-colors"
        >
          Volver
        </button>
      </div>

      {showAddEntradaModal && (
        <EntradasModal
          onClose={() => {
            setShowAddEntradaModal(false);
            setEntradaSeleccionada(null);
          }}
          entrada={null}
          evento={evento}
          API_URL={API_URL}
          fetchEntradas={fetchEntradas}
        />
      )}

      {showEditEntradaModal && (
        <EntradaModal
          onClose={() => {
            setShowEditEntradaModal(false);
            setEntradaSeleccionada(null);
          }}
          entrada={entradaSeleccionada}
          evento={evento}
          API_URL={API_URL}
          fetchEntradas={fetchEntradas}
        />
      )}
    </div>
  );
}
