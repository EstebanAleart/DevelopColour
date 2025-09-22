export default function FormCheckbox({ label, name, checked, onChange }) {
  return (
    <div className="flex items-center mb-3 md:mb-4">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        className="mr-2 h-4 w-4 text-yellow-600 bg-gray-700 border-yellow-600 rounded focus:ring-yellow-500"
        id={name}
      />
      <label htmlFor={name} className="text-white text-xs md:text-sm">
        {label}
      </label>
    </div>
  );
}
