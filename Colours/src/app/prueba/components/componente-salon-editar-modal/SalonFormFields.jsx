"use client";

import { formatCUIT } from "./validation";

export default function SalonFormFields({
  formData,
  handleChange,
  handleBlur,
  selectedImage,
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
      <div className="space-y-3 md:space-y-4">
        <div>
          <input
            type="text"
            name="salon"
            placeholder="Nombre del Salón *"
            className="w-full p-2 md:p-3 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs md:text-sm"
            value={formData.salon}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <input
            type="text"
            name="nombre"
            placeholder="Contacto *"
            className="w-full p-2 md:p-3 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs md:text-sm"
            value={formData.nombre}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <input
            type="number"
            name="capacidad"
            placeholder="Capacidad"
            min="1"
            className="w-full p-2 md:p-3 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs md:text-sm"
            value={formData.capacidad}
            onChange={handleChange}
          />
        </div>
        <div>
          <input
            type="text"
            name="cuit"
            placeholder="CUIT (11 dígitos) *"
            className="w-full p-2 md:p-3 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs md:text-sm"
            value={formData.cuit}
            onChange={handleChange}
            maxLength="11"
            required
          />
          {formData.cuit.length === 11 && (
            <span className="text-green-400 text-xs md:text-sm">
              {formatCUIT(formData.cuit)}
            </span>
          )}
        </div>
        <div>
          <input
            type="email"
            name="email"
            placeholder="Email *"
            className="w-full p-2 md:p-3 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs md:text-sm"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="estatus"
            checked={formData.estatus}
            onChange={handleChange}
            className="h-4 w-4 md:h-5 md:w-5 text-[#BF8D6B] rounded"
          />
          <span className="text-xs md:text-sm text-white">Activo</span>
        </div>
      </div>

      <div className="space-y-3 md:space-y-4">
        <div>
          <input
            type="tel"
            name="whatsapp"
            placeholder="WhatsApp *"
            className="w-full p-2 md:p-3 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs md:text-sm"
            value={formData.whatsapp}
            onChange={handleChange}
            onBlur={handleBlur}
            required
          />
        </div>
        <div>
          <input
            type="text"
            name="MercadopagoKeyP"
            placeholder="Clave Pública MP"
            className="w-full p-2 md:p-3 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs md:text-sm"
            value={formData.MercadopagoKeyP}
            onChange={handleChange}
          />
        </div>
        <div>
          <input
            type="text"
            name="Mercadopago"
            placeholder="Token MP"
            className="w-full p-2 md:p-3 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs md:text-sm"
            value={formData.Mercadopago}
            onChange={handleChange}
          />
        </div>
        <div>
          <input
            type="text"
            name="cbu"
            placeholder="CBU"
            className="w-full p-2 md:p-3 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs md:text-sm"
            value={formData.cbu}
            onChange={handleChange}
          />
        </div>
        <div>
          <input
            type="text"
            name="alias"
            placeholder="Alias CBU"
            className="w-full p-2 md:p-3 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs md:text-sm"
            value={formData.alias}
            onChange={handleChange}
          />
        </div>
      </div>
    </div>
  );
}
