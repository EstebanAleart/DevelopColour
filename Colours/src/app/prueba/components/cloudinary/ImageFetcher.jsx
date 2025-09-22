// components/ImageFetcher.js
"use client";

import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import apiUrls from "@/app/components/utils/apiConfig";

const API_URL = apiUrls;

const useImageFetcher = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchImages = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/upload/images`, {
        cache: "no-store",
      });

      if (!res.ok) throw new Error("No se pudieron obtener las imágenes");

      const data = await res.json();
      setImages(data);
    } catch (err) {
      setError(err.message);
      Swal.fire({
        icon: "error",
        title: "Error al obtener imágenes",
        text: err.message || "Ocurrió un error al obtener las imágenes",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const refreshImages = () => {
    fetchImages();
  };

  return { images, loading, error, refreshImages };
};

export default useImageFetcher;
