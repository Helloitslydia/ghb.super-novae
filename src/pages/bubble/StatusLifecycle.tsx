import React from 'react';
import { ArrowRight, RefreshCw } from 'lucide-react';
import { statusTransitions } from './workflowData';

export function StatusLifecycle() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-gray-400 overflow-hidden">
      <div className="p-6 sm:p-8">
        <div className="flex items-center gap-2.5 mb-1.5">
          <RefreshCw className="w-4 h-4 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900">Cycle de vie du dossier</h3>
        </div>
        <p className="text-sm text-gray-500 mb-6 ml-6">
          Toutes les transitions possibles entre les statuts d'un dossier
        </p>

        <div className="space-y-2.5">
          {statusTransitions.map((t, i) => (
            <div
              key={i}
              className="flex items-center gap-2 sm:gap-3 p-3 rounded-xl
                         bg-gray-50/80 hover:bg-gray-100/80 transition-colors duration-200"
              style={{ animation: `bubble-appear 0.3s ease-out ${i * 60}ms both` }}
            >
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${t.fromColor}`}>
                {t.from}
              </span>

              <div className="flex items-center gap-0.5 flex-shrink-0">
                <div className="h-px w-3 sm:w-6 bg-gray-300" />
                <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
              </div>

              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${t.toColor}`}>
                {t.to}
              </span>

              <div className="hidden sm:block h-4 w-px bg-gray-200 mx-1" />
              <span className="hidden sm:inline text-xs text-gray-500 italic">{t.action}</span>
              <span className={`text-[10px] font-semibold ml-auto whitespace-nowrap ${t.actorColor}`}>
                {t.actor}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
