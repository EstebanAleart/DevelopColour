export default function FormFields({ formData, handleChange, handleBlur }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-2">
      <input
        type="text"
        name="salon"
        placeholder="Nombre del Salón *"
        value={formData.salon}
        onChange={handleChange}
        className="w-full p-2 md:p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs md:text-sm"
        required
      />
      <input
        type="text"
        name="nombre"
        placeholder="Nombre del Contacto *"
        value={formData.nombre}
        onChange={handleChange}
        className="w-full p-2 md:p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs md:text-sm"
        required
      />
      <input
        type="number"
        name="capacidad"
        placeholder="Capacidad"
        min="1"
        value={formData.capacidad}
        onChange={handleChange}
        className="w-full p-2 md:p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs md:text-sm"
      />
      <input
        type="text"
        name="cuit"
        placeholder="CUIT (11 dígitos) *"
        value={formData.cuit}
        onChange={handleChange}
        className="w-full p-2 md:p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs md:text-sm"
        maxLength="11"
        required
      />
      <input
        type="email"
        name="email"
        placeholder="Email *"
        value={formData.email}
        onChange={handleChange}
        className="w-full p-2 md:p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs md:text-sm"
        required
      />
      <input
        type="tel"
        name="whatsapp"
        placeholder="WhatsApp *"
        value={formData.whatsapp}
        onChange={handleChange}
        onBlur={handleBlur}
        className="w-full p-2 md:p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs md:text-sm"
        required
      />
      <input
        type="text"
        name="MercadopagoKeyP"
        placeholder="Clave Pública de MercadoPago"
        value={formData.MercadopagoKeyP}
        onChange={handleChange}
        className="w-full p-2 md:p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs md:text-sm"
      />
      <input
        type="text"
        name="Mercadopago"
        placeholder="Token de MercadoPago"
        value={formData.Mercadopago}
        onChange={handleChange}
        className="w-full p-2 md:p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs md:text-sm"
      />
      <input
        type="text"
        name="cbu"
        placeholder="CBU"
        value={formData.cbu}
        onChange={handleChange}
        className="w-full p-2 md:p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs md:text-sm"
      />
      <input
        type="text"
        name="alias"
        placeholder="Alias CBU"
        value={formData.alias}
        onChange={handleChange}
        className="w-full p-2 md:p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs md:text-sm"
      />
      <div className="flex items-center col-span-1 md:col-span-1">
        <label className="flex items-center space-x-1 text-white text-xs md:text-sm">
          <span>Estatus:</span>
          <select
            name="estatus"
            value={formData.estatus}
            onChange={handleChange}
            className="ml-1 p-1 md:p-1 bg-transparent text-white rounded border border-[#BF8D6B] text-xs md:text-sm"
          >
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </label>
      </div>
    </div>
  );
}
