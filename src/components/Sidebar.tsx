import React from 'react';
import { 
  Home, 
  Sun, 
  Database, 
  Moon, 
  Sunrise, 
  Settings, 
  ShieldCheck, 
  ShieldAlert, 
  Link, 
  Unlink 
} from 'lucide-react';

interface SidebarProps {
  currentSection: string;
  setCurrentSection: (section: string) => void;
  guardrailsApplied: boolean;
  phoenixEndpoint: string;
}

export default function Sidebar({ 
  currentSection, 
  setCurrentSection, 
  guardrailsApplied, 
  phoenixEndpoint 
}: SidebarProps) {
  const items = [
    { id: 'landing', label: 'Overview', icon: Home },
    { id: 'day', label: 'Live Support Mode', icon: Sun },
    { id: 'traces', label: 'Trace Memory', icon: Database },
    { id: 'dream', label: 'Replay Lab', icon: Moon },
    { id: 'morning', label: 'Recovery Report', icon: Sunrise },
    { id: 'arize', label: 'Arize Integration', icon: Settings },
  ];

  return (
    <aside className="w-68 shrink-0 bg-white border-r border-[#E2E8F0] flex flex-col justify-between h-screen sticky top-0">
      <div className="flex flex-col">
        {/* Brand Banner */}
        <div className="p-6 border-b border-[#F1F5F9] flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-500 to-cyan-400 flex items-center justify-center text-white font-bold text-lg tracking-wider shadow-md shadow-violet-200">
            Ω
          </div>
          <div>
            <h1 className="font-sans font-bold text-gray-900 tracking-tight text-lg">
              REM Agent
            </h1>
            <p className="text-[10px] text-violet-500 font-mono tracking-widest font-semibold uppercase">
              Replay . Evaluate . Mend
            </p>
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="p-4 space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = currentSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentSection(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-violet-50 to-indigo-50/50 text-violet-700 font-semibold border-l-4 border-violet-600'
                    : 'text-gray-500 hover:bg-[#F8FAFC] hover:text-gray-900'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-violet-600' : 'text-gray-400'} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Observability Connection Badges */}
      <div className="p-4 bg-[#F8FAFC] border-t border-[#F1F5F9] m-3 rounded-xl space-y-3">
        {/* Guardrail Status Widget */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500 font-medium">Compliance Guardrails</span>
          <div className="flex items-center gap-1.5 font-semibold">
            {guardrailsApplied ? (
              <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 tracking-tight">
                <ShieldCheck size={12} />
                GUARDRAIL-ENHANCED
              </span>
            ) : (
              <span className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100 uppercase tracking-tight">
                <ShieldAlert size={12} />
                BASELINE
              </span>
            )}
          </div>
        </div>

        {/* Collector Status Badge */}
        <div className="flex items-center justify-between text-xs pt-1.5 border-t border-[#EDF2F7]">
          <span className="text-gray-500 font-medium">Phoenix Tracer</span>
          {phoenixEndpoint ? (
            <span className="flex items-center gap-1 font-semibold text-cyan-600">
              <Link size={11} />
              Connected
            </span>
          ) : (
            <span className="flex items-center gap-1 font-semibold text-gray-400">
              <Unlink size={11} />
              Local-Only
            </span>
          )}
        </div>
        
        {phoenixEndpoint && (
          <div className="text-[10px] font-mono text-gray-400 max-w-full truncate bg-white p-1 rounded border border-gray-100">
            {phoenixEndpoint}
          </div>
        )}
      </div>
    </aside>
  );
}
