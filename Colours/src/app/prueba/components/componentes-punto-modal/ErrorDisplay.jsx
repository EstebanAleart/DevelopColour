export default function ErrorDisplay({ error }) {
  return (
    <div className="p-2 md:p-2 bg-red-900/50 text-red-300 text-xs rounded border border-red-700">
      {error}
    </div>
  );
}
