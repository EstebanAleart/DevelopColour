export default function FormFields({
  formData,
  selectedUser,
  usuarios,
  loadingUsuarios,
  onUserChange,
  onFieldChange,
  onFieldBlur,
}) {
  return (
    <div className="space-y-2 md:space-y-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-2">
        <input
          type="text"
          name="razon"
          placeholder="Razón Social *"
          value={formData.razon}
          onChange={onFieldChange}
          className="w-full p-2 md:p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs md:text-sm"
          required
        />
        <input
          type="text"
          name="nombre"
          placeholder="Nombre *"
          value={formData.nombre}
          onChange={onFieldChange}
          className="w-full p-2 md:p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs md:text-sm"
          required
        />
        <input
          type="text"
          name="direccion"
          placeholder="Dirección *"
          value={formData.direccion}
          onChange={onFieldChange}
          className="w-full p-2 md:p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs md:text-sm"
          required
        />
        <input
          type="text"
          name="cuit"
          placeholder="CUIT (11 dígitos) *"
          value={formData.cuit}
          onChange={onFieldChange}
          className="w-full p-2 md:p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs md:text-sm"
          maxLength="11"
          required
        />
        <input
          type="email"
          name="email"
          placeholder="E-mail *"
          value={formData.email}
          onChange={onFieldChange}
          className="w-full p-2 md:p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs md:text-sm"
          required
        />
        <input
          type="tel"
          name="telefono"
          placeholder="Teléfono *"
          value={formData.telefono}
          onChange={onFieldChange}
          onBlur={onFieldBlur}
          className="w-full p-2 md:p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs md:text-sm"
          required
        />
        <div className="flex items-center col-span-1 md:col-span-2">
          <label className="flex items-center space-x-1 text-white text-xs md:text-sm">
            <input
              type="checkbox"
              name="es_online"
              checked={formData.es_online}
              onChange={onFieldChange}
              className="h-4 w-4 text-[#BF8D6B] rounded"
            />
            <span>Online</span>
          </label>
        </div>
      </div>

      <div className="mb-2 md:mb-3">
        <label className="block text-xs md:text-sm text-gray-300 mb-1">
          Asignar Vendedor
        </label>
        <select
          className="w-full p-2 md:p-2 bg-transparent text-white rounded border border-[#BF8D6B] text-xs md:text-sm"
          value={selectedUser}
          onChange={(e) => onUserChange(e.target.value)}
          disabled={loadingUsuarios}
        >
          <option value="">
            {loadingUsuarios
              ? "Cargando usuarios..."
              : "Selecciona un vendedor"}
          </option>
          {usuarios.map((usuario) => (
            <option key={usuario.id} value={usuario.id}>
              {usuario.nombre}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
