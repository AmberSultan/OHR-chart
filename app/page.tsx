import CultureAura from "@/components/CultureAura";
import { cultureDomains, behaviouralIncidents, behaviourStatusMix, statusColors, calculateCultureIndex, getScoreColor } from "@/lib/data";

export default function Home() {
  const cultureIndex = calculateCultureIndex();
  const scoreColor = getScoreColor(cultureIndex);

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
        {/* Main Aura Visualization */}
        <div className="rounded-lg bg-zinc-900 p-4 shadow-lg min-h-[550px] flex items-center justify-center">
          <CultureAura />
        </div>

        {/* <div className="mt-6 flex gap-6">

          <div className="w-1/2 rounded-lg bg-zinc-900 p-4 shadow border border-zinc-800">
            <h3 className="mb-3 font-semibold text-white flex items-center justify-between">
              <span>Culture Domains</span>
              <span className="text-sm font-normal text-zinc-400">
                Score: <span style={{ color: scoreColor }} className="font-semibold">{cultureIndex}</span>
              </span>
            </h3>
            <div className="space-y-0 max-h-[300px] overflow-y-auto">
              {cultureDomains.map((domain) => {
                const color = getScoreColor(domain.score);
                return (
                  <div key={domain.domain} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-zinc-300">{domain.domain}</span>
                    </div>
                    <div className="flex items-center gap-3 text-zinc-400">
                      <span className="text-xs">w: {domain.weight}</span>
                      <span style={{ color }} className="font-medium w-8 text-right"> {domain.score}</span>
                    </div>
                  </div>
                );
              })}
            </div>
        
          </div>

         
          <div className="w-1/2 rounded-lg bg-zinc-900 p-4 shadow border border-zinc-800">
            <h3 className="mb-3 font-semibold text-white">
              Behavioural Incidents
            </h3>
            <div className="space-y-3">
              {behaviouralIncidents.map((incident) => {
                const statuses = behaviourStatusMix.filter(s => s.behaviour === incident.behaviour);
                const getStatusValue = (statusName: string) => {
                  const found = statuses.find(s => s.status === statusName);
                
                  return found ? (found.proportion ).toFixed(2)  : "0";
                };
                return (
                  <div key={incident.behaviour} className="text-sm group relative cursor-pointer">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-zinc-300">{incident.behaviour}</span>
                      <span className="text-zinc-400">{incident.ratePerHundred}/100</span>
                    </div>
               
                    <div className="h-2 bg-zinc-700 rounded-full overflow-hidden flex">
                      {statuses.length > 0 ? (
                        statuses.map((status, idx) => (
                          <div
                            key={idx}
                            className="h-full"
                            style={{
                              width: `${status.proportion * 100}%`,
                              backgroundColor: statusColors[status.status] || '#6b7280'
                            }}
                          />
                        ))
                      ) : (
                        <div className="bg-zinc-600 h-full w-full" />
                      )}
                    </div>
              
                    <div className="absolute left-0 top-full mt-1 hidden group-hover:block bg-zinc-800 border border-zinc-600 rounded-lg p-3 shadow-xl z-10 min-w-[180px]">
                      <div className="text-xs font-semibold text-white mb-2">{incident.behaviour}</div>
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center justify-between gap-3">
                          <span className="flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-[#eab308]" />
                            <span className="text-zinc-300">Reported</span>
                          </span>
                          <span className="text-zinc-400">{getStatusValue("Reported")}</span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <span className="flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-blue-500" />
                            <span className="text-zinc-300">Investigating</span>
                          </span>
                          <span className="text-zinc-400">{getStatusValue("Investigating")}</span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <span className="flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-red-500" />
                            <span className="text-zinc-300">Substantiated</span>
                          </span>
                          <span className="text-zinc-400">{getStatusValue("Substantiated")}</span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <span className="flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-green-500" />
                            <span className="text-zinc-300">Unsubstantiated</span>
                          </span>
                          <span className="text-zinc-400">{getStatusValue("Unsubstantiated")}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 pt-3 border-t border-zinc-700">
              <div className="flex flex-wrap gap-4 text-xs text-zinc-500">
                <div className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-[#eab308]" />
                  <span>Reported</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                  <span>Investigating</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                  <span>Substantiated</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  <span>Unsubstantiated</span>
                </div>
              </div>
            </div>
          </div>
        </div> */}


      
        {/* <div className="mt-4 rounded-lg bg-zinc-800/50 p-4 border border-zinc-700">
          <p className="text-sm text-zinc-400 text-center">
            <span className="text-zinc-300 font-medium">Shape</span> indicates pressure/activity (greater outward distortion = higher incidents or lower scores).
            <span className="text-zinc-300 font-medium ml-2">Color</span> indicates status (
            <span className="text-green-500">green ≥80</span>,
            <span className="text-orange-500 ml-1">amber 65-79</span>,
            <span className="text-red-500 ml-1">red &lt;65</span>).
          </p>
        </div> */}
      </main>
    </div>
  );
}
