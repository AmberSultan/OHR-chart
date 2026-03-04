import CultureAura from "@/components/CultureAura";

export default function WithoutLines() {
  return (
    <div className="min-h-screen bg-black">
      <header className="border-b border-zinc-700 bg-zinc-900 px-6 py-4">
        <h1 className="text-2xl font-bold text-white">
          Culture Index Dashboard
        </h1>
        <p className="text-sm text-zinc-400">
          Living visualization of organizational culture and unresolved risk
        </p>
      </header>

      <main className="container mx-auto p-6">
        <div className="rounded-lg bg-zinc-900 p-4 shadow-lg min-h-[550px] flex items-center justify-center">
          <CultureAura showAxisLines={false} />
        </div>
      </main>
    </div>
  );
}
