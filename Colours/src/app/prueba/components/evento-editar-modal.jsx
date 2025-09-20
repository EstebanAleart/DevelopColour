"use client";

import { useState, useEffect } from "react";
import {
  X,
  Calendar,
  Clock,
  Users,
  Home,
  Check,
  Image,
  RefreshCw,
  Loader,
  Plus,
  Trash2,
  FileText,
  ChevronDown,
} from "lucide-react";
import apiUrls from "@/app/components/utils/apiConfig";
import Swal from "sweetalert2";

const API_URL = apiUrls;

export default function EventoEditarModal({
  evento,
  onClose,
  onEventoUpdated,
}) {
  const [formData, setFormData] = useState({
    nombre: "",
    fecha: "",
    duracion: 60,
    capacidad: 1,
    activo: true,
    salonId: "",
    descripcion: "",
    image: "",
  });

  const [salones, setSalones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingSalones, setFetchingSalones] = useState(true);
  const [error, setError] = useState(null);
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loadingImages, setLoadingImages] = useState(false);
  const [activeTab, setActiveTab] = useState("info");
  const [entradas, setEntradas] = useState([]);
  const [loadingEntradas, setLoadingEntradas] = useState(false);
  const [errorEntradas, setErrorEntradas] = useState(null);
  const [nuevaEntrada, setNuevaEntrada] = useState({
    tipo: "",
    precio: "",
    cantidad: "",
  });
  const [editandoEntradaId, setEditandoEntradaId] = useState(null);
  const [entradaEdit, setEntradaEdit] = useState({
    tipo: "",
    precio: "",
    cantidad: "",
    estatus: "",
  });

  // Contrato states
  const [numeroContrato, setNumeroContrato] = useState("");
  const [montoContrato, setMontoContrato] = useState("");
  const [cantidadGraduados, setCantidadGraduados] = useState("");
  const [minimoCenas, setMinimoCenas] = useState("");
  const [minimoBrindis, setMinimoBrindis] = useState("");
  const [firmantes, setFirmantes] = useState([
    { nombre: "", apellido: "", telefono: "", mail: "" },
  ]);
  const [fechaFirma, setFechaFirma] = useState("");
  const [vendedor, setVendedor] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [fechaSenia, setFechaSenia] = useState("");
  const [pdf, setPdf] = useState(null);
  const [loadingContrato, setLoadingContrato] = useState(false);
  const [errorContrato, setErrorContrato] = useState(null);
  const [contratoId, setContratoId] = useState("");
  const [contratoData, setContratoData] = useState(null);
  const [pdfUrl, setPdfUrl] = useState("");

  useEffect(() => {
    if (evento) {
      const eventDate = new Date(evento.fecha);
      const formattedDate = eventDate.toISOString().slice(0, 16);

      setFormData({
        nombre: evento.nombre || "",
        fecha: formattedDate,
        duracion: evento.duracion || 60,
        capacidad: evento.capacidad || 1,
        activo: evento.activo !== undefined ? evento.activo : true,
        salonId: evento.salonId || "",
        descripcion: evento.descripcion || "",
        image: evento.image || "",
      });

      if (evento.image) {
        setSelectedImage(evento.image);
      }
    }
  }, [evento]);

  useEffect(() => {
    if (!evento?.id) {
      Swal.fire({
        title: "Error",
        text: "El evento no tiene un ID válido. No se puede editar.",
        icon: "error",
      });
      onClose();
    }
  }, [evento]);

  useEffect(() => {
    const fetchSalones = async () => {
      try {
        setFetchingSalones(true);
        const response = await fetch(`${API_URL}/api/salon?limit=100`);
        if (!response.ok) {
          throw new Error("Error al cargar los salones");
        }

        const data = await response.json();
        let salonesData = [];

        if (data.success && Array.isArray(data.data)) {
          salonesData = data.data;
        } else if (Array.isArray(data)) {
          salonesData = data;
        } else if (data.salones && Array.isArray(data.salones)) {
          salonesData = data.salones;
        }

        const activeSalones = salonesData.filter(
          (salon) =>
            salon.estatus === true ||
            salon.isActive === true ||
            salon.activo === true
        );

        const validSalones = activeSalones.filter((salon) => {
          return salon.Id || salon.id || salon._id;
        });

        const normalizedSalones = validSalones.map((salon) => ({
          Id: salon.Id || salon.id || salon._id,
          nombre: salon.salon || salon.nombre || "Salón sin nombre",
          capacidad: salon.capacidad,
        }));

        setSalones(normalizedSalones);

        if (normalizedSalones.length === 0) {
          setError(
            "No hay salones disponibles o los salones no tienen IDs válidos"
          );
        }
      } catch (err) {
        console.error("Error fetching salones:", err);
        setError("No se pudieron cargar los salones: " + err.message);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudieron cargar los salones: " + err.message,
        });
      } finally {
        setFetchingSalones(false);
      }
    };

    fetchSalones();
    fetchImages();
  }, []);

  const fetchImages = async () => {
    setLoadingImages(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/upload/images`, {
        cache: "no-store",
      });

      if (!res.ok) throw new Error("No se pudieron obtener las imágenes");

      const data = await res.json();
      setImages(data);
    } catch (err) {
      console.error("Error al cargar imágenes:", err);
      setError("Error al obtener imágenes: " + err.message);
    } finally {
      setLoadingImages(false);
    }
  };

  const selectImage = (url) => {
    setSelectedImage(url);
    setFormData((prev) => ({
      ...prev,
      image: url,
    }));
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;

    if (type === "number") {
      setFormData({
        ...formData,
        [name]: Number.parseInt(value) || 0,
      });
    } else if (type === "checkbox") {
      setFormData({
        ...formData,
        [name]: e.target.checked,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!evento?.id) {
        throw new Error(
          "El ID del evento no está definido. No se puede actualizar el evento."
        );
      }

      const formattedData = {
        ...formData,
        fecha: formData.fecha,
        salonNombre:
          salones.find((salon) => salon.Id === formData.salonId)?.nombre ||
          evento.salon ||
          "",
      };

      const response = await fetch(`${API_URL}/api/evento/${evento.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            `Error ${response.status}: ${response.statusText}`
        );
      }

      const result = await response.json();

      if (result.success) {
        if (onEventoUpdated) onEventoUpdated();
        onClose();
      } else {
        throw new Error(
          result.message || "Error desconocido al actualizar el evento"
        );
      }
    } catch (err) {
      setError(
        err.message ||
          "No se pudo actualizar el evento. Por favor intente nuevamente."
      );
    } finally {
      setLoading(false);
    }
  };

  const getTodayString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const hours = String(today.getHours()).padStart(2, "0");
    const minutes = String(today.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  useEffect(() => {
    if (activeTab === "entradas" && evento?.id) {
      fetchEntradas();
    }
  }, [activeTab, evento?.id]);

  const fetchEntradas = async () => {
    setLoadingEntradas(true);
    setErrorEntradas(null);
    try {
      const res = await fetch(`${API_URL}/api/entrada/${evento.id}`);
      if (!res.ok) throw new Error("No se pudieron obtener las entradas");
      const data = await res.json();
      setEntradas(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      setErrorEntradas(err.message || "Error al obtener entradas");
    } finally {
      setLoadingEntradas(false);
    }
  };

  const handleNuevaEntradaChange = (e) => {
    const { name, value } = e.target;
    setNuevaEntrada((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAgregarEntrada = async (e) => {
    e.preventDefault();
    setLoadingEntradas(true);
    setErrorEntradas(null);
    try {
      const body = {
        ...nuevaEntrada,
        eventoId: evento.id,
        precio: Number(nuevaEntrada.precio),
        cantidad: Number(nuevaEntrada.cantidad),
      };
      const res = await fetch(`${API_URL}/api/entrada/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("No se pudo agregar la entrada");
      setNuevaEntrada({ tipo: "", precio: "", cantidad: "" });
      fetchEntradas();
    } catch (err) {
      setErrorEntradas(err.message || "Error al agregar entrada");
    } finally {
      setLoadingEntradas(false);
    }
  };

  const handleEditarEntrada = async (entrada) => {
    const result = await Swal.fire({
      title: "¿Editar entrada?",
      text: "¿Seguro que deseas editar esta entrada?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, editar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    });
    if (result.isConfirmed) {
      setEditandoEntradaId(entrada.id || entrada._id);
      setEntradaEdit({
        tipo: entrada.tipo_entrada || entrada.tipo || "",
        precio: entrada.precio || "",
        cantidad: entrada.cantidad || "",
        estatus: entrada.estatus || "",
      });
    }
  };

  const handleEntradaEditChange = (e) => {
    const { name, value } = e.target;
    setEntradaEdit((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleActualizarEntrada = async () => {
    if (!editandoEntradaId) return;

    setLoadingEntradas(true);
    setErrorEntradas(null);
    try {
      const body = {
        tipo_entrada: entradaEdit.tipo,
        precio: Number(entradaEdit.precio),
        cantidad: Number(entradaEdit.cantidad),
        estatus: entradaEdit.estatus,
      };

      const res = await fetch(`${API_URL}/api/entrada/${editandoEntradaId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("No se pudo actualizar la entrada");

      setEditandoEntradaId(null);
      fetchEntradas();
    } catch (err) {
      setErrorEntradas(err.message || "Error al actualizar entrada");
    } finally {
      setLoadingEntradas(false);
    }
  };

  const handleEliminarEntrada = async (entradaId) => {
    const result = await Swal.fire({
      title: "¿Eliminar entrada?",
      text: "Esta acción no se puede deshacer. ¿Deseas continuar?",
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
      fetchEntradas();
    } catch (err) {
      setErrorEntradas(err.message || "Error al eliminar entrada");
    } finally {
      setLoadingEntradas(false);
    }
  };

  const handleFirmanteChange = (idx, field, value) => {
    setFirmantes((prev) =>
      prev.map((f, i) => (i === idx ? { ...f, [field]: value } : f))
    );
  };

  const agregarFirmante = () => {
    setFirmantes((prev) => [
      ...prev,
      { nombre: "", apellido: "", telefono: "", mail: "" },
    ]);
  };

  const eliminarFirmante = (idx) => {
    setFirmantes((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleContratoSubmit = async (e) => {
    e.preventDefault();
    if (!pdf) {
      setErrorContrato("Debes seleccionar un PDF");
      return;
    }
    setLoadingContrato(true);
    setErrorContrato(null);
    try {
      const formDataContrato = new FormData();
      formDataContrato.append("numeroContrato", numeroContrato);
      formDataContrato.append("montoContrato", montoContrato);
      formDataContrato.append("cantidadGraduados", cantidadGraduados);
      formDataContrato.append("minimoCenas", minimoCenas);
      formDataContrato.append("minimoBrindis", minimoBrindis);
      formDataContrato.append("fechaFirma", fechaFirma);
      formDataContrato.append("vendedor", vendedor);
      formDataContrato.append("observaciones", observaciones);
      formDataContrato.append("fechaSenia", fechaSenia);
      formDataContrato.append("pdf", pdf);
      formDataContrato.append("firmantes", JSON.stringify(firmantes));

      const res = await fetch(`${API_URL}/api/evento/${evento.id}/contrato`, {
        method: "POST",
        body: formDataContrato,
      });
      if (!res.ok) throw new Error("Error al guardar contrato");
      Swal.fire({
        icon: "success",
        title: "Contrato guardado",
        text: "El contrato se guardó correctamente.",
      });
    } catch (err) {
      setErrorContrato(err.message);
    } finally {
      setLoadingContrato(false);
    }
  };

  const handleContratoJsonSubmit = async () => {
    setLoadingContrato(true);
    setErrorContrato(null);

    if (!numeroContrato || !montoContrato) {
      setErrorContrato("Completa los campos obligatorios del contrato.");
      setLoadingContrato(false);
      return;
    }

    try {
      const contratoJson = {
        numeroContrato,
        montoContrato: parseFloat(montoContrato),
        cantidadGraduados: parseInt(cantidadGraduados) || 0,
        minimoCenas: parseInt(minimoCenas) || 0,
        minimoBrindis: parseInt(minimoBrindis) || 0,
        firmantes,
        fechaFirma,
        vendedor,
        observaciones,
        fechaSenia,
        pdf: pdfUrl || "",
        eventoId: evento.id,
      };

      const res = await fetch(`${API_URL}/api/evento/${evento.id}/contrato`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(contratoJson),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error al guardar contrato");
      }

      Swal.fire({
        icon: "success",
        title: "Contrato guardado",
        text: "El contrato se guardó correctamente.",
      });
    } catch (err) {
      setErrorContrato(err.message);
    } finally {
      setLoadingContrato(false);
    }
  };

  useEffect(() => {
    if (activeTab === "contrato" && evento?.id) {
      setContratoId(evento.id);
      fetchContrato();
    }
  }, [activeTab, evento?.id]);

  const fetchContrato = async () => {
    setLoadingContrato(true);
    setErrorContrato(null);
    try {
      const res = await fetch(`${API_URL}/api/evento/${evento.id}/contrato`);
      if (res.status === 400) {
        Swal.fire({
          icon: "warning",
          title: "Sin contrato",
          text: "No hay ningún contrato registrado para este evento.",
        });
        setContratoData(null);
        setNumeroContrato("");
        setMontoContrato("");
        setCantidadGraduados("");
        setMinimoCenas("");
        setMinimoBrindis("");
        setFirmantes([{ nombre: "", apellido: "", telefono: "", mail: "" }]);
        setFechaFirma("");
        setVendedor("");
        setObservaciones("");
        setFechaSenia("");
        setContratoId("");
        return;
      }
      if (!res.ok) throw new Error("No se pudo obtener el contrato");
      const data = await res.json();
      const contrato = Array.isArray(data.data) ? data.data[0] : data.data;
      if (!contrato) {
        Swal.fire({
          icon: "warning",
          title: "Sin contrato",
          text: "No hay ningún contrato registrado para este evento.",
        });
        setContratoData(null);
        setNumeroContrato("");
        setMontoContrato("");
        setCantidadGraduados("");
        setMinimoCenas("");
        setMinimoBrindis("");
        setFirmantes([{ nombre: "", apellido: "", telefono: "", mail: "" }]);
        setFechaFirma("");
        setVendedor("");
        setObservaciones("");
        setFechaSenia("");
        setContratoId("");
        return;
      }
      setContratoData(contrato);
      setNumeroContrato(contrato?.numeroContrato || "");
      setMontoContrato(contrato?.montoContrato || "");
      setCantidadGraduados(contrato?.cantidadGraduados || "");
      setMinimoCenas(contrato?.minimoCenas || "");
      setMinimoBrindis(contrato?.minimoBrindis || "");
      setFirmantes(
        contrato?.firmantes || [
          { nombre: "", apellido: "", telefono: "", mail: "" },
        ]
      );
      setFechaFirma(contrato?.fechaFirma || "");
      setVendedor(contrato?.vendedor || "");
      setObservaciones(contrato?.observaciones || "");
      setFechaSenia(contrato?.fechaSenia || "");
      setContratoId(contrato?.id || "");
    } catch (err) {
      setErrorContrato(err.message);
    } finally {
      setLoadingContrato(false);
    }
  };

  const handleEliminarContrato = async () => {
    if (!contratoId) {
      Swal.fire({ icon: "warning", title: "ID de contrato requerido" });
      return;
    }
    const confirm = await Swal.fire({
      icon: "warning",
      title: "¿Eliminar contrato?",
      text: "Esta acción no se puede deshacer.",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });
    if (!confirm.isConfirmed) return;

    setLoadingContrato(true);
    setErrorContrato(null);
    try {
      const res = await fetch(
        `${API_URL}/api/evento/${evento.id}/contrato/${contratoId}`,
        {
          method: "DELETE",
        }
      );
      if (!res.ok) throw new Error("No se pudo eliminar el contrato");
      Swal.fire({ icon: "success", title: "Contrato eliminado" });
      setContratoData(null);
      setContratoId("");
    } catch (err) {
      setErrorContrato(err.message);
    } finally {
      setLoadingContrato(false);
    }
  };

  const handleActualizarContrato = async () => {
    if (!contratoId) {
      setErrorContrato("ID de contrato requerido para actualizar.");
      return;
    }
    setLoadingContrato(true);
    setErrorContrato(null);
    try {
      const contratoJson = {
        numeroContrato,
        montoContrato: parseFloat(montoContrato),
        cantidadGraduados: parseInt(cantidadGraduados) || 0,
        minimoCenas: parseInt(minimoCenas) || 0,
        minimoBrindis: parseInt(minimoBrindis) || 0,
        firmantes,
        fechaFirma,
        vendedor,
        observaciones,
        fechaSenia,
        pdf: pdfUrl || "",
        eventoId: evento.id,
      };
      const res = await fetch(
        `${API_URL}/api/evento/${evento.id}/contrato/${contratoId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(contratoJson),
        }
      );
      if (res.status === 400) {
        Swal.fire({
          icon: "warning",
          title: "Sin contrato",
          text: "No hay ningún contrato registrado para este evento.",
        });
        setContratoData(null);
        setNumeroContrato("");
        setMontoContrato("");
        setCantidadGraduados("");
        setMinimoCenas("");
        setMinimoBrindis("");
        setFirmantes([{ nombre: "", apellido: "", telefono: "", mail: "" }]);
        setFechaFirma("");
        setVendedor("");
        setObservaciones("");
        setFechaSenia("");
        setContratoId("");
        setLoadingContrato(false);
        return;
      }
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error al actualizar contrato");
      }
      Swal.fire({ icon: "success", title: "Contrato actualizado" });
      fetchContrato();
    } catch (err) {
      setErrorContrato(err.message);
    } finally {
      setLoadingContrato(false);
    }
  };

  const handlePdfUpload = async (file) => {
    if (!file) return;
    setLoadingContrato(true);
    setErrorContrato(null);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch(`${API_URL}/api/upload/image`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Error al subir el PDF");
      const data = await res.json();
      const url = data.url || data.fileUrl || "";
      setPdfUrl(url);
      Swal.fire({
        icon: "success",
        title: "PDF subido",
        text: "El archivo PDF se subió correctamente.",
      });
    } catch (err) {
      setErrorContrato(err.message);
    } finally {
      setLoadingContrato(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-2 md:p-4 ">
      <div className="bg-[#1a1a1a] rounded-lg p-3 md:p-4 w-full max-w-xs md:max-w-3xl max-h-[95vh] overflow-y-auto shadow-lg">
        <div className="flex justify-between items-center mb-3 md:mb-3">
          <h2 className="text-base md:text-lg font-bold text-white">
            Editar Evento
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 md:p-0"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4 md:h-5 md:w-5" />
          </button>
        </div>

        {error && (
          <div className="p-2 md:p-2 bg-red-900/50 text-red-300 text-xs md:text-sm rounded border border-red-700 mb-3 md:mb-3">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 mb-3 md:mb-3">
          <button
            onClick={() => setActiveTab("info")}
            className={`py-2 px-2 text-xs w-full flex items-center justify-center rounded ${
              activeTab === "info"
                ? "text-[#BF8D6B] border-2 border-[#BF8D6B] bg-gray-900"
                : "text-gray-400 hover:text-white border border-gray-700"
            }`}
          >
            Información
          </button>
          <button
            onClick={() => setActiveTab("imagenes")}
            className={`py-2 px-2 text-xs w-full flex items-center justify-center rounded ${
              activeTab === "imagenes"
                ? "text-[#BF8D6B] border-2 border-[#BF8D6B] bg-gray-900"
                : "text-gray-400 hover:text-white border border-gray-700"
            }`}
          >
            Imágenes
          </button>
          <button
            onClick={() => setActiveTab("entradas")}
            className={`py-2 px-2 text-xs w-full flex items-center justify-center rounded ${
              activeTab === "entradas"
                ? "text-[#BF8D6B] border-2 border-[#BF8D6B] bg-gray-900"
                : "text-gray-400 hover:text-white border border-gray-700"
            }`}
          >
            Entradas
          </button>
          <button
            onClick={() => setActiveTab("contrato")}
            className={`py-2 px-2 text-xs w-full flex items-center justify-center rounded ${
              activeTab === "contrato"
                ? "text-[#BF8D6B] border-2 border-[#BF8D6B] bg-gray-900"
                : "text-gray-400 hover:text-white border border-gray-700"
            }`}
          >
            Contrato
          </button>
        </div>

        {activeTab === "info" ? (
          <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
            <div>
              <label className="block text-xs md:text-sm text-white mb-1">
                Nombre del Evento
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="nombre"
                  placeholder="Nombre del Evento"
                  className="w-full p-2 md:p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs md:text-sm pl-8"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs md:text-sm text-white mb-1">
                Salón
              </label>
              {evento?.salon && (
                <div className="p-2 bg-transparent text-[#BF8D6B] rounded border border-[#BF8D6B] text-xs md:text-sm mb-3">
                  Salón asignado: {evento.salon}
                </div>
              )}
              {fetchingSalones ? (
                <div className="p-2 text-center bg-transparent text-[#BF8D6B] rounded border border-[#BF8D6B] text-xs md:text-sm">
                  Cargando salones...
                </div>
              ) : (
                <>
                  {salones.length > 0 ? (
                    <div className="relative">
                      <select
                        name="salonId"
                        className="w-full p-2 md:p-2 bg-black text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs md:text-sm pl-8 appearance-none"
                        value={formData.salonId}
                        onChange={handleChange}
                      >
                        <option value="">Seleccionar Salón</option>
                        {salones.map((salon) => (
                          <option key={salon.Id} value={salon.Id}>
                            {salon.nombre}{" "}
                            {salon.capacidad
                              ? `(Capacidad: ${salon.capacidad})`
                              : ""}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                        <ChevronDown className="h-3 w-3 md:h-4 md:w-4 text-[#BF8D6B]" />
                      </div>
                    </div>
                  ) : (
                    <div className="p-2 bg-[#BF8D6B]/20 border border-[#BF8D6B] text-[#BF8D6B] rounded text-xs md:text-sm">
                      No hay salones disponibles. Por favor, agregue un salón
                      primero.
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-3">
              <div>
                <label className="block text-xs md:text-sm text-white mb-1">
                  Fecha y Hora
                </label>
                <div className="relative">
                  <input
                    type="datetime-local"
                    name="fecha"
                    className="w-full p-2 md:p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs md:text-sm pl-8"
                    value={formData.fecha}
                    onChange={handleChange}
                    min={getTodayString()}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs md:text-sm text-white mb-1">
                  Duración (min)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="duracion"
                    placeholder="Duración en minutos"
                    className="w-full p-2 md:p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs md:text-sm pl-8"
                    value={formData.duracion}
                    onChange={handleChange}
                    min="1"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-3">
              <div>
                <label className="block text-xs md:text-sm text-white mb-1">
                  Capacidad
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="capacidad"
                    placeholder="Capacidad"
                    className="w-full p-2 md:p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs md:text-sm pl-8"
                    value={formData.capacidad}
                    onChange={handleChange}
                    min="1"
                    required
                  />
                </div>
              </div>
              <div className="flex items-center h-full pt-6">
                <label className="flex items-center cursor-pointer text-xs md:text-sm text-white">
                  <div className="relative">
                    <input
                      type="checkbox"
                      name="activo"
                      id="activo"
                      className="sr-only"
                      checked={formData.activo}
                      onChange={handleChange}
                    />
                    <div
                      className={`block w-8 h-4 md:w-10 md:h-5 rounded-full transition-colors ${
                        formData.activo ? "bg-[#BF8D6B]" : "bg-gray-600"
                      }`}
                    ></div>
                    <div
                      className={`absolute left-0.5 top-0.5 bg-white w-3 h-3 md:w-4 md:h-4 rounded-full transition-transform ${
                        formData.activo
                          ? "transform translate-x-4 md:translate-x-5"
                          : ""
                      }`}
                    ></div>
                  </div>
                  <div className="ml-2">
                    {formData.activo ? "Activo" : "Inactivo"}
                  </div>
                </label>
              </div>
            </div>

            {formData.image && (
              <div className="mt-2">
                <div className="text-xs text-[#BF8D6B] mb-1">
                  URL actual de la imagen:
                </div>
                <div className="p-2 bg-transparent rounded border border-[#BF8D6B] text-white text-xs break-all">
                  {formData.image}
                </div>
                <img
                  src={formData.image}
                  alt="Vista previa"
                  className="h-12 md:h-16 rounded border border-[#BF8D6B] mt-2"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/placeholder-image.jpg";
                    e.target.alt = "Error al cargar la imagen";
                  }}
                />
              </div>
            )}

            <div>
              <label className="block text-xs md:text-sm text-white mb-1">
                Descripción del Evento (opcional)
              </label>
              <textarea
                name="descripcion"
                placeholder="Descripción detallada del evento"
                className="w-full p-2 md:p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs md:text-sm"
                value={formData.descripcion}
                onChange={handleChange}
                rows="2"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full mt-3 md:mt-4 font-bold py-2 md:py-2 px-2 rounded bg-[#BF8D6B] text-white text-xs md:text-sm flex items-center justify-center gap-2"
              disabled={loading || fetchingSalones || salones.length === 0}
            >
              {loading ? (
                "Actualizando..."
              ) : (
                <>
                  <Check className="h-3 w-3 md:h-4 md:w-4" />
                  <span>Actualizar Evento</span>
                </>
              )}
            </button>
          </form>
        ) : activeTab === "imagenes" ? (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-sm md:text-base font-semibold text-white">
                Seleccionar imagen para el evento
              </h3>
              <button
                onClick={fetchImages}
                className="text-xs text-[#BF8D6B] hover:text-[#a67454] flex items-center"
              >
                <RefreshCw className="h-3 w-3 mr-1" /> Actualizar
              </button>
            </div>

            {formData.image && (
              <div className="p-2 bg-transparent rounded border border-[#BF8D6B] mb-3">
                <div className="text-xs text-[#BF8D6B] mb-1">
                  URL actual de la imagen:
                </div>
                <div className="text-white text-xs break-all">
                  {formData.image}
                </div>
              </div>
            )}

            {loadingImages ? (
              <div className="py-4 md:py-6 text-center text-[#BF8D6B]">
                <Loader className="animate-spin h-5 w-5 md:h-6 md:w-6 mx-auto mb-2" />
                <p className="text-xs">Cargando imágenes...</p>
              </div>
            ) : images.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {images.map((image, index) => (
                  <div key={image.id || index} className="relative">
                    <img
                      src={image.url}
                      alt={`Imagen ${index + 1}`}
                      className={`w-full h-16 md:h-20 object-cover rounded border cursor-pointer ${
                        selectedImage === image.url
                          ? "border-green-500 ring-1 ring-green-500"
                          : "border-[#BF8D6B] hover:border-[#a67454]"
                      }`}
                      onClick={() => selectImage(image.url)}
                    />
                    {selectedImage === image.url && (
                      <div className="absolute top-1 right-1 bg-green-500 text-white rounded-full p-0.5">
                        <Check className="h-2 w-2 md:h-3 md:w-3" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-4 md:py-6 text-center text-gray-400 border border-dashed border-gray-600 rounded text-xs md:text-sm">
                <Image className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-1 opacity-50" />
                <p>No hay imágenes disponibles</p>
              </div>
            )}

            <div className="flex justify-end mt-3 gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("info")}
                className="px-2 py-1 md:px-3 md:py-1 text-[#BF8D6B] hover:text-[#a67454] border border-[#BF8D6B] rounded text-xs transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (selectedImage) {
                    setFormData((prev) => ({ ...prev, image: selectedImage }));
                    setActiveTab("info");
                  } else {
                    Swal.fire({
                      icon: "warning",
                      title: "Ninguna imagen seleccionada",
                      text: "Por favor seleccione una imagen o vuelva al formulario.",
                    });
                  }
                }}
                className="px-2 py-1 md:px-3 md:py-1 bg-[#BF8D6B] hover:bg-[#a67454] text-white rounded border border-[#BF8D6B] text-xs flex items-center gap-1 transition-colors"
              >
                <Check className="h-3 w-3" />
                <span>Usar imagen seleccionada</span>
              </button>
            </div>
          </div>
        ) : activeTab === "entradas" ? (
          <div className="space-y-3">
            <h3 className="text-sm md:text-base font-semibold text-white mb-2">
              Entradas del Evento
            </h3>
            {errorEntradas && (
              <div className="p-2 bg-red-900/50 text-red-300 text-xs rounded border border-red-700 mb-2">
                {errorEntradas}
              </div>
            )}
            {loadingEntradas ? (
              <div className="py-4 md:py-6 text-center text-[#BF8D6B]">
                <Loader className="animate-spin h-5 w-5 md:h-6 md:w-6 mx-auto mb-2" />
                <p className="text-xs">Cargando entradas...</p>
              </div>
            ) : (
              <>
                {entradas.length > 0 ? (
                  <div className="w-full">
                    <table className="w-full text-xs text-left text-gray-300 mb-3">
                      <thead>
                        <tr className="bg-gray-700 text-[#BF8D6B]">
                          <th className="px-2 py-2">Tipo</th>
                          <th className="px-2 py-2">Precio</th>
                          <th className="px-2 py-2">Estatus</th>
                          <th className="px-2 py-2">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {entradas.map((entrada) =>
                          editandoEntradaId === (entrada.id || entrada._id) ? (
                            <tr
                              key={entrada.id || entrada._id}
                              className="border-b border-gray-700 bg-gray-900"
                            >
                              <td className="px-2 py-2">
                                <input
                                  type="text"
                                  name="tipo"
                                  className="w-full bg-transparent border border-[#BF8D6B] rounded p-1 text-white text-xs"
                                  value={entradaEdit.tipo}
                                  onChange={handleEntradaEditChange}
                                  required
                                />
                              </td>
                              <td className="px-2 py-2">
                                <input
                                  type="number"
                                  name="precio"
                                  className="w-full bg-transparent border border-[#BF8D6B] rounded p-1 text-white text-xs"
                                  value={entradaEdit.precio}
                                  onChange={handleEntradaEditChange}
                                  min="0"
                                  required
                                />
                              </td>
                              <td className="px-2 py-2">
                                <input
                                  type="text"
                                  name="estatus"
                                  className="w-full bg-transparent border border-[#BF8D6B] rounded p-1 text-white text-xs"
                                  value={entradaEdit.estatus}
                                  onChange={handleEntradaEditChange}
                                />
                              </td>
                              <td className="px-2 py-2 flex gap-1">
                                <button
                                  className="bg-green-700 hover:bg-green-600 text-white rounded px-2 py-1 text-xs"
                                  onClick={handleActualizarEntrada}
                                  disabled={loadingEntradas}
                                  title="Guardar"
                                >
                                  Guardar
                                </button>
                                <button
                                  className="bg-gray-600 hover:bg-gray-500 text-white rounded px-2 py-1 text-xs"
                                  onClick={() => setEditandoEntradaId(null)}
                                  type="button"
                                  title="Cancelar"
                                >
                                  Cancelar
                                </button>
                              </td>
                            </tr>
                          ) : (
                            <tr
                              key={entrada.id || entrada._id}
                              className="border-b border-gray-700"
                            >
                              <td className="px-2 py-2">
                                {entrada.tipo_entrada || entrada.tipo}
                              </td>
                              <td className="px-2 py-2">${entrada.precio}</td>
                              <td className="px-2 py-2">
                                {entrada.estatus || "-"}
                              </td>
                              <td className="px-2 py-2 flex gap-1">
                                <button
                                  className="text-blue-500 hover:text-blue-300 text-xs"
                                  title="Editar entrada"
                                  onClick={() => handleEditarEntrada(entrada)}
                                  type="button"
                                >
                                  Editar
                                </button>
                                <button
                                  className="text-red-500 hover:text-red-300 text-xs"
                                  title="Eliminar entrada"
                                  onClick={() =>
                                    handleEliminarEntrada(
                                      entrada.id || entrada._id
                                    )
                                  }
                                  type="button"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-4 text-center text-gray-400 border border-dashed border-gray-600 rounded text-xs md:text-sm">
                    No hay entradas para este evento.
                  </div>
                )}
              </>
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
          </div>
        ) : (
          activeTab === "contrato" && (
            <form
              onSubmit={handleContratoSubmit}
              className="space-y-3 overflow-y-auto"
              style={{ maxHeight: "60vh" }}
            >
              <div className="flex gap-2 items-end">
                <button
                  type="button"
                  className="px-2 py-1 md:px-3 md:py-1 bg-[#BF8D6B] hover:bg-[#a67454] text-white rounded text-xs"
                  disabled={loadingContrato || !contratoId}
                  onClick={handleActualizarContrato}
                >
                  {loadingContrato ? "Actualizando..." : "Actualizar Contrato"}
                </button>
                <button
                  type="button"
                  className="px-2 py-1 md:px-3 md:py-1 bg-red-700 hover:bg-red-600 text-white rounded text-xs"
                  onClick={handleEliminarContrato}
                  disabled={loadingContrato || !contratoId}
                >
                  Eliminar contrato
                </button>
              </div>
              <div>
                <label className="block text-xs md:text-sm text-white mb-1">
                  Número de Contrato
                </label>
                <input
                  type="text"
                  className="w-full p-2 md:p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs md:text-sm"
                  value={numeroContrato}
                  onChange={(e) => setNumeroContrato(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-xs md:text-sm text-white mb-1">
                  Monto
                </label>
                <input
                  type="number"
                  className="w-full p-2 md:p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs md:text-sm"
                  value={montoContrato}
                  onChange={(e) => setMontoContrato(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-xs md:text-sm text-white mb-1">
                  Cantidad de graduados
                </label>
                <input
                  type="number"
                  className="w-full p-2 md:p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs md:text-sm"
                  value={cantidadGraduados}
                  onChange={(e) => setCantidadGraduados(e.target.value)}
                  min="0"
                />
              </div>
              <div>
                <label className="block text-xs md:text-sm text-white mb-1">
                  Mínimo de cenas
                </label>
                <input
                  type="number"
                  className="w-full p-2 md:p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs md:text-sm"
                  value={minimoCenas}
                  onChange={(e) => setMinimoCenas(e.target.value)}
                  min="0"
                />
              </div>
              <div>
                <label className="block text-xs md:text-sm text-white mb-1">
                  Mínimo de brindis
                </label>
                <input
                  type="number"
                  className="w-full p-2 md:p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs md:text-sm"
                  value={minimoBrindis}
                  onChange={(e) => setMinimoBrindis(e.target.value)}
                  min="0"
                />
              </div>
              <div>
                <label className="block text-xs md:text-sm text-white mb-1">
                  Firmantes
                </label>
                {firmantes.map((f, idx) => (
                  <div
                    key={idx}
                    className="mb-2 p-2 bg-transparent rounded border border-[#BF8D6B]"
                  >
                    <div className="flex gap-2 mb-1">
                      <input
                        type="text"
                        placeholder="Apellido*"
                        className="w-full p-1 md:p-1 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs"
                        value={f.apellido}
                        onChange={(e) =>
                          handleFirmanteChange(idx, "apellido", e.target.value)
                        }
                        required
                      />
                      <input
                        type="text"
                        placeholder="Nombre*"
                        className="w-full p-1 md:p-1 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs"
                        value={f.nombre}
                        onChange={(e) =>
                          handleFirmanteChange(idx, "nombre", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div className="flex gap-2 mb-1">
                      <input
                        type="text"
                        placeholder="Teléfono"
                        className="w-full p-1 md:p-1 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs"
                        value={f.telefono}
                        onChange={(e) =>
                          handleFirmanteChange(idx, "telefono", e.target.value)
                        }
                      />
                      <input
                        type="email"
                        placeholder="Mail"
                        className="w-full p-1 md:p-1 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs"
                        value={f.mail}
                        onChange={(e) =>
                          handleFirmanteChange(idx, "mail", e.target.value)
                        }
                      />
                    </div>
                    {firmantes.length > 1 && (
                      <button
                        type="button"
                        className="text-xs text-red-400 hover:text-red-200"
                        onClick={() => eliminarFirmante(idx)}
                      >
                        Eliminar firmante
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  className="text-xs text-[#BF8D6B] hover:text-[#a67454] mt-1"
                  onClick={agregarFirmante}
                >
                  + Agregar firmante
                </button>
              </div>
              <div>
                <label className="block text-xs md:text-sm text-white mb-1">
                  Fecha de firma
                </label>
                <input
                  type="date"
                  className="w-full p-2 md:p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs md:text-sm"
                  value={fechaFirma}
                  onChange={(e) => setFechaFirma(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs md:text-sm text-white mb-1">
                  Vendedor
                </label>
                <input
                  type="text"
                  className="w-full p-2 md:p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs md:text-sm"
                  value={vendedor}
                  onChange={(e) => setVendedor(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs md:text-sm text-white mb-1">
                  Observaciones
                </label>
                <textarea
                  className="w-full p-2 md:p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs md:text-sm"
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-xs md:text-sm text-white mb-1">
                  Fecha de seña
                </label>
                <input
                  type="date"
                  className="w-full p-2 md:p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs md:text-sm"
                  value={fechaSenia}
                  onChange={(e) => setFechaSenia(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs md:text-sm text-white mb-1">
                  Archivo PDF
                </label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => {
                    setPdf(e.target.files[0]);
                    handlePdfUpload(e.target.files[0]);
                  }}
                  required
                  className="w-full p-2 md:p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs md:text-sm"
                />
                {pdf && (
                  <span className="text-xs text-gray-200">{pdf.name}</span>
                )}

                {(pdfUrl || contratoData?.pdf) && (
                  <div className="text-xs text-green-400 mt-1">
                    PDF subido:{" "}
                    <a
                      href={pdfUrl || contratoData?.pdf}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                    >
                      {pdfUrl || contratoData?.pdf}
                    </a>
                  </div>
                )}
              </div>
              {errorContrato && (
                <div className="text-red-400 text-xs">{errorContrato}</div>
              )}
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  className="px-2 py-1 md:px-3 md:py-1 bg-[#BF8D6B] hover:bg-[#a67454] text-white rounded text-xs"
                  disabled={loadingContrato}
                  onClick={handleContratoJsonSubmit}
                >
                  {loadingContrato ? "Enviando..." : "Guardar Contrato"}
                </button>
              </div>
            </form>
          )
        )}
      </div>
    </div>
  );
}
