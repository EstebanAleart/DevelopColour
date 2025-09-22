"use client";

import { useState, useEffect } from "react";
import Swal from "sweetalert2";

export default function GestionContrato({ evento, API_URL }) {
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
    if (evento?.id) {
      setContratoId(evento.id);
      fetchContrato();
    }
  }, [evento?.id]);

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
    <form
      onSubmit={(e) => e.preventDefault()}
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
        {pdf && <span className="text-xs text-gray-200">{pdf.name}</span>}

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
  );
}
