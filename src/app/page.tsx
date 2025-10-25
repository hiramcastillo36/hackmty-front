export default function HomePage() {
  return (
    <main className="p-8 text-gray-900">
      <h1 className="text-3xl font-bold mb-4">SmartCatering Dashboard</h1>
      <p className="text-gray-600 mb-8">
        Monitorea y optimiza las operaciones de catering aéreo en tiempo real.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <a href="/bottle" className="p-6 bg-white shadow rounded-xl hover:shadow-lg transition">
          <h2 className="font-semibold text-lg mb-2">Alcohol Bottle Handling</h2>
          <p className="text-sm text-gray-500">Automatiza reglas de reutilización y cumplimiento por aerolínea.</p>
        </a>

        <a href="/errors" className="p-6 bg-white shadow rounded-xl hover:shadow-lg transition">
          <h2 className="font-semibold text-lg mb-2">Real-Time Error Detection</h2>
          <p className="text-sm text-gray-500">Detecta y corrige errores antes de impactar operaciones.</p>
        </a>

        <a href="/efficiency" className="p-6 bg-white shadow rounded-xl hover:shadow-lg transition">
          <h2 className="font-semibold text-lg mb-2">Employee Efficiency</h2>
          <p className="text-sm text-gray-500">Mejora el rendimiento y la motivación del personal.</p>
        </a>
      </div>
    </main>
  );
}
