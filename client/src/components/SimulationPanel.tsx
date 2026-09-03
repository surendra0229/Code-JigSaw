import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, RotateCcw, Cpu, X, AlertCircle } from 'lucide-react';
import { SimulationResult } from '../types/game';

interface SimulationPanelProps {
  simulation: SimulationResult | null;
  loading: boolean;
  onClose: () => void;
}

export const SimulationPanel: React.FC<SimulationPanelProps> = ({
  simulation,
  loading,
  onClose
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  useEffect(() => {
    setCurrentStepIndex(0);
    setIsPlaying(false);
  }, [simulation]);

  useEffect(() => {
    let interval: any = null;
    if (isPlaying && simulation && simulation.steps.length > 0) {
      interval = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev >= simulation.steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1200);
    }
    return () => clearInterval(interval);
  }, [isPlaying, simulation]);

  if (!simulation && !loading) return null;

  return (
    <div className="mt-4 rounded-xl border border-indigo/40 bg-jet-black overflow-hidden shadow-2xl">
      {/* Simulation Header */}
      <div className="bg-dark-slate px-4 py-2.5 border-b border-gunmetal flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-indigo" />
          <span className="text-xs font-mono font-bold text-snow-white">Line-by-Line Code Simulation Engine</span>
        </div>
        <button
          onClick={onClose}
          className="text-cool-gray hover:text-snow-white p-1 rounded hover:bg-graphite transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="p-6 text-center text-xs font-mono text-indigo flex items-center justify-center gap-3">
          <div className="w-4 h-4 border-2 border-indigo border-t-transparent rounded-full animate-spin" />
          <span>Generating execution step trace...</span>
        </div>
      ) : simulation && !simulation.supported ? (
        <div className="p-5 text-xs font-mono text-cool-gray bg-graphite/50 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-snow-white mb-1">Simulation Unavailable</p>
            <p>{simulation.message || "Simulation is currently unavailable for this language."}</p>
          </div>
        </div>
      ) : simulation && simulation.steps.length > 0 ? (
        (() => {
          const step = simulation.steps[currentStepIndex];
          return (
            <div className="p-4 font-mono text-xs space-y-4">
              {/* Controls Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-graphite p-2.5 rounded-lg border border-gunmetal">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setIsPlaying(false);
                      setCurrentStepIndex(0);
                    }}
                    title="Restart"
                    className="p-1.5 rounded hover:bg-dark-slate text-cool-gray hover:text-snow-white"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      setIsPlaying(false);
                      setCurrentStepIndex(prev => Math.max(0, prev - 1));
                    }}
                    disabled={currentStepIndex === 0}
                    title="Previous Step"
                    className="p-1.5 rounded hover:bg-dark-slate text-cool-gray hover:text-snow-white disabled:opacity-30"
                  >
                    <SkipBack className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="flex items-center gap-1.5 px-3 py-1 rounded bg-indigo hover:bg-indigo-600 text-white font-bold transition-colors"
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{isPlaying ? 'Pause' : 'Play'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsPlaying(false);
                      setCurrentStepIndex(prev => Math.min(simulation.steps.length - 1, prev + 1));
                    }}
                    disabled={currentStepIndex >= simulation.steps.length - 1}
                    title="Next Step"
                    className="p-1.5 rounded hover:bg-dark-slate text-cool-gray hover:text-snow-white disabled:opacity-30"
                  >
                    <SkipForward className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-[11px] text-cool-gray">
                  Step <span className="text-snow-white font-bold">{step.stepNumber}</span> of {simulation.steps.length}
                </div>
              </div>

              {/* Current Line & Explanation */}
              <div className="bg-dark-slate p-3 rounded-lg border border-indigo/30">
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-indigo/20 text-indigo text-[10px] px-2 py-0.5 rounded font-bold uppercase">
                    Line {step.lineNumber}
                  </span>
                  <span className="text-snow-white font-semibold whitespace-pre">{step.code}</span>
                </div>
                <p className="text-[11px] text-indigo-300 mt-1 italic">
                  💡 {step.explanation}
                </p>
              </div>

              {/* Memory / Scope Variables Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-graphite p-3 rounded-lg border border-gunmetal">
                  <span className="text-cool-gray text-[10px] uppercase font-bold tracking-wider block mb-2">
                    Variables in Scope:
                  </span>
                  {Object.keys(step.variables).length === 0 ? (
                    <span className="text-cool-gray italic text-[11px]">No active variables yet</span>
                  ) : (
                    <div className="space-y-1">
                      {Object.entries(step.variables).map(([k, v]) => (
                        <div key={k} className="flex items-center justify-between text-[11px] border-b border-gunmetal/40 pb-1">
                          <span className="text-steel-blue font-semibold">{k}</span>
                          <span className="text-emerald-green font-mono">{JSON.stringify(v)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Output Console Trace */}
                <div className="bg-graphite p-3 rounded-lg border border-gunmetal">
                  <span className="text-cool-gray text-[10px] uppercase font-bold tracking-wider block mb-2">
                    Accumulated Output:
                  </span>
                  {step.output ? (
                    <pre className="text-emerald-green text-[11px] whitespace-pre-wrap">{step.output}</pre>
                  ) : (
                    <span className="text-cool-gray italic text-[11px]">No output generated yet</span>
                  )}
                </div>
              </div>
            </div>
          );
        })()
      ) : null}
    </div>
  );
};
