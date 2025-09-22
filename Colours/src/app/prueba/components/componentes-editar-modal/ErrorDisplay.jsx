export default function ErrorDisplay({ message }) {
  return (
    <div className="mb-3 md:mb-4 p-2 md:p-3 bg-red-900/50 text-red-300 text-xs md:text-sm rounded-lg border border-red-700">
      {message}
    </div>
  );
}
