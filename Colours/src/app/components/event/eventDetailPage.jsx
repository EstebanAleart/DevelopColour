"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import apiUrls from "@/app/components/utils/apiConfig";
import { ImageOff } from "lucide-react";
import useUserRoleFromLocalStorage from "../hook/userRoleFromLocalstorage";

export default function EventDetailPage({ idFromEvent }) {
  const API_URL = apiUrls;
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [eventId, setEventId] = useState(idFromEvent || null);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageError, setImageError] = useState(false);
  const { userRole, loadingRole } = useUserRoleFromLocalStorage();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (eventId) {
      fetchEventDetails(eventId);
    }
  }, []);

  const fetchEventDetails = async (idToFetch) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/evento/${idToFetch}`);
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const result = await response.json();
      if (result.success && result.data) {
        setEvent(result.data);
      } else {
        throw new Error("No se pudo obtener la información del evento");
      }
    } catch (err) {
      console.error("Error fetching event details:", err);
      setError(err.message || "Error al cargar los detalles del evento");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return date
      .toLocaleDateString("es-ES", options)
      .replace(/^\w/, (c) => c.toUpperCase());
  };

  if (!mounted || loading || loadingRole) {
    return (
      <main className="min-h-screen w-full flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#1a1a1a] p-4 rounded-lg shadow-lg text-white">
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 border-t-2 border-[#BF8D6B] rounded-full animate-spin"></div>
            <p className="text-sm">Cargando detalles del evento...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen w-full flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#1a1a1a] p-4 rounded-lg shadow-lg text-white">
          <h1 className="text-lg font-bold mb-3 text-red-400">Error</h1>
          <p className="mb-3 text-sm">{error}</p>
          <button
            onClick={() => fetchEventDetails(eventId)}
            className="w-full font-bold py-2 px-2 rounded bg-[#BF8D6B] text-white text-sm"
          >
            Intentar nuevamente
          </button>
        </div>
      </main>
    );
  }

  if (!event) {
    return (
      <main className="min-h-screen w-full flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#1a1a1a] p-4 rounded-lg shadow-lg text-white">
          <h1 className="text-lg font-bold mb-3">Evento no encontrado</h1>
          <p className="mb-3 text-sm">
            No se pudo encontrar la información del evento solicitado.
          </p>
          <button
            onClick={() => router.push("/vendor")}
            className="w-full font-bold py-2 px-2 rounded bg-[#BF8D6B] text-white text-sm"
          >
            Volver
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className=" w-full flex items-center justify-center p-4">
      <div className="w-full max-w-md  p-4 rounded-lg  text-white">
        <div className="mb-3 relative rounded overflow-hidden">
          {imageError ? (
            <div className="w-full h-40 bg-transparent flex items-center justify-center border border-[#BF8D6B]">
              <div className="flex flex-col items-center text-[#BF8D6B]">
                <ImageOff className="w-8 h-8 mb-1" />
                <p className="text-xs">Imagen no disponible</p>
              </div>
            </div>
          ) : (
            <div className="relative w-full h-40 bg-transparent border border-[#BF8D6B]">
              <img
                src={event.image || "/placeholder.svg"}
                alt={event.nombre}
                className="w-full h-full object-cover transition-opacity duration-300"
                onError={() => setImageError(true)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            </div>
          )}
        </div>
        <h1 className="text-lg font-bold mb-1">{event.nombre}</h1>
        <p className="text-xs text-[#BF8D6B] mb-1">
          Salón: {event.salonNombre}
        </p>
        <p className="text-xs text-[#BF8D6B] mb-1">
          Fecha: {formatDate(event.fecha)}
        </p>
        <p className="text-xs text-[#BF8D6B] mb-3">
          Duración: {event.duracion} minutos • Capacidad: {event.capacidad}{" "}
          personas
        </p>
        <div className="space-y-3 mb-4">
          <div className="bg-transparent p-3 rounded border border-[#BF8D6B]">
            <h2 className="text-sm font-semibold mb-2 text-[#BF8D6B]">
              Descripción
            </h2>
            <p className="text-xs text-gray-300">{event.descripcion}</p>
          </div>
        </div>
        <button
          onClick={() => {
            if (userRole) {
              const path =
                userRole === "admin"
                  ? `/prueba/vender/${eventId}/buy`
                  : `/vendor/event/${eventId}/buy`;
              router.push(path);
            }
          }}
          className="w-full font-bold py-2 px-2 rounded bg-[#BF8D6B] text-white text-sm"
        >
          Vender entrada
        </button>
      </div>
    </main>
  );
}
