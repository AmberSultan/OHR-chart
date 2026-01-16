import SunburstChart from "@/components/SunburstChart";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <header className="border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-700 dark:bg-zinc-800">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Culture Index Dashboard
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Interactive sunburst visualization of organizational culture metrics
        </p>
      </header>

      <main className="container mx-auto p-6">
        <div className="rounded-lg bg-white p-4 shadow-lg dark:bg-zinc-800 h-[700px] ">
          <SunburstChart />
        </div>



        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-white p-4 shadow dark:bg-zinc-800">
            <h3 className="mb-2 font-semibold text-zinc-900 dark:text-zinc-100">
              Score Legend
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-green-500"></span>
                <span className="text-zinc-700 dark:text-zinc-300">
                  High (≥80)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-orange-500"></span>
                <span className="text-zinc-700 dark:text-zinc-300">
                  Medium (65-79)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-red-500"></span>
                <span className="text-zinc-700 dark:text-zinc-300">
                  Low (&lt;65)
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-4 shadow dark:bg-zinc-800">
            <h3 className="mb-2 font-semibold text-zinc-900 dark:text-zinc-100">
              Incident Status
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-blue-500"></span>
                <span className="text-zinc-700 dark:text-zinc-300">
                  Reported / Investigating
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-red-500"></span>
                <span className="text-zinc-700 dark:text-zinc-300">
                  Substantiated
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-green-500"></span>
                <span className="text-zinc-700 dark:text-zinc-300">
                  Unsubstantiated
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-4 shadow dark:bg-zinc-800">
            <h3 className="mb-2 font-semibold text-zinc-900 dark:text-zinc-100">
              Instructions
            </h3>
            <p className="text-sm text-zinc-700 dark:text-zinc-300">
              Click on segments to zoom in. Click the center to zoom out.
              Hover for details.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
