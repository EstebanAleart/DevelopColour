export default function FormFields({
  formData,
  userData,
  handleChange,
  handleBlur,
}) {
  return (
    <>
      <div className="w-full">
        <input
          type="text"
          id="usuario"
          name="usuario"
          placeholder="Usuario *"
          className="w-full p-2 md:p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 focus:outline-none focus:ring-1 md:focus:ring-2 focus:ring-[#BF8D6B] text-xs md:text-sm"
          value={formData.usuario}
          onChange={handleChange}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
        <input
          type="text"
          name="nombre"
          placeholder="Nombre *"
          className="w-full p-2 md:p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 focus:outline-none focus:ring-1 md:focus:ring-2 focus:ring-[#BF8D6B] text-xs md:text-sm"
          value={formData.nombre}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="apellido"
          placeholder="Apellido *"
          className="w-full p-2 md:p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 focus:outline-none focus:ring-1 md:focus:ring-2 focus:ring-[#BF8D6B] text-xs md:text-sm"
          value={formData.apellido}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="dni"
          placeholder="DNI"
          className="w-full p-2 md:p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 focus:outline-none focus:ring-1 md:focus:ring-2 focus:ring-[#BF8D6B] text-xs md:text-sm"
          value={formData.dni}
          onChange={handleChange}
          onBlur={handleBlur}
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          className="w-full p-2 md:p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 focus:outline-none focus:ring-1 md:focus:ring-2 focus:ring-[#BF8D6B] text-xs md:text-sm"
          value={formData.email}
          onChange={handleChange}
        />

        <input
          type="text"
          name="direccion"
          placeholder="Dirección"
          className="w-full p-2 md:p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 focus:outline-none focus:ring-1 md:focus:ring-2 focus:ring-[#BF8D6B] text-xs md:text-sm"
          value={formData.direccion}
          onChange={handleChange}
        />

        <input
          type="text"
          name="whatsapp"
          placeholder="WhatsApp"
          className="w-full p-2 md:p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 focus:outline-none focus:ring-1 md:focus:ring-2 focus:ring-[#BF8D6B] text-xs md:text-sm"
          value={formData.whatsapp}
          onChange={handleChange}
          onBlur={handleBlur}
        />

        {!userData && (
          <>
            <input
              type="password"
              name="password"
              placeholder="Contraseña *"
              className="w-full p-2 md:p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 focus:outline-none focus:ring-1 md:focus:ring-2 focus:ring-[#BF8D6B] text-xs md:text-sm"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <input
              type="password"
              placeholder="Repetir Contraseña *"
              className="w-full p-2 md:p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 focus:outline-none focus:ring-1 md:focus:ring-2 focus:ring-[#BF8D6B] text-xs md:text-sm"
            />
          </>
        )}
      </div>
    </>
  );
}
